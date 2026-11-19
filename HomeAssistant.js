const fs = require('fs')
const pinyin = require("node-pinyin")

const pk = JSON.parse(fs.readFileSync(__dirname + '/package.json', 'utf-8'))

// Home Assistant shows this block in the device info and uses it in its event log.
// Recommended for every discovery payload since HA 2022.x.
const ORIGIN = {
  name: 'node-red-contrib-ha-mqtt',
  sw_version: pk.version,
  support_url: pk.homepage || 'https://github.com/shaonianzhentan/node-red-contrib-ha-mqtt'
}

// Home Assistant versions that introduced each MQTT discovery platform.
// The default "latest" disables all gating, so existing flows are unaffected.
const PLATFORM_MIN_VERSION = {
  scene: '2020.12',
  number: '2021.2',
  select: '2021.7',
  humidifier: '2021.8',
  update: '2021.11',
  button: '2021.12',
  siren: '2022.3',
  text: '2022.12',
  image: '2023.7',
  water_heater: '2023.7',
  event: '2023.8',
  lawn_mower: '2023.9',
  valve: '2024.1',
  notify: '2024.5',
  datetime: '2026.5',
  date: '2026.5',
  time: '2026.5',
  infrared: '2026.7'
}

// Discovery attributes that only exist in newer HA versions. Applied after the
// user's JSON config is merged so hand-written keys are filtered as well.
// "schema" is deliberately absent: it is also a valid light/platform key and
// infrared is already covered by the platform gate above.
const ATTRIBUTE_MIN_VERSION = {
  event_types: '2023.8',
  reports_position: '2024.1',
  activity_state_topic: '2023.9'
}

// Values that were renamed by HA. Remapped only from the version where the new
// value became valid, so users explicitly selecting an old HA keep the old value.
const VALUE_RULES = [
  {
    platform: 'binary_sensor',
    key: 'device_class',
    min: '2022.9',
    map: { cool: 'cold', warm: 'heat', carbon_monoxide: 'gas' }
  }
]

function parseVersion(version) {
  if (!version || version === 'latest') return null
  return String(version).split('.').map(part => parseInt(part, 10) || 0)
}

function compareVersion(left, right) {
  const a = parseVersion(left)
  const b = parseVersion(right)
  if (!a) return 1
  if (!b) return -1
  const len = Math.max(a.length, b.length)
  for (let i = 0; i < len; i++) {
    const diff = (a[i] || 0) - (b[i] || 0)
    if (diff !== 0) return diff > 0 ? 1 : -1
  }
  return 0
}

function object_id(name) {
  let arr = pinyin(String(name || ''), { style: 'normal' })
  return arr.map(ele => ele[0]).join('_').replace(/ /g, "_")
}

const DiscoveryDevice = {}
let activeNodes = 0
let statusSubscribed = false
module.exports = class HomeAssistant {
  constructor(node, cfg, device = {}) {
    const { device_info, retain, haVersion } = device || {}
    this.retain = retain === true
    this.device_info = device_info || { name: 'Home Assistant' }
    this.haVersion = haVersion || 'latest'
    activeNodes++
    node.config = cfg.config
    this.node = node

    const { name } = cfg
    const entity_id = `${object_id(this.device_info.name)}_${object_id(name)}`
    const type = node.type.replace('ha-mqtt-', '')
    const topic = `ha-mqtt/${type}/${entity_id}/`

    const custom = this.customConfig()
    const availability_topic = Object.prototype.hasOwnProperty.call(custom, 'availability_topic')
      ? custom.availability_topic
      : `${topic}availability/state`
    this.availability = availability_topic ? {
      topic: availability_topic,
      payload_available: custom.payload_available || 'online',
      payload_not_available: custom.payload_not_available || 'offline'
    } : null

    this.config = {
      name,
      unique_id: topic.replace(/\//g, '_'),
      discovery_topic: `homeassistant/${type}/${entity_id}/config`,
      state_topic: `${topic}state`,
      json_attr_t: `${topic}attr`,
      command_topic: `${topic}set`,
      position_topic: `${topic}position/state`,
      set_position_topic: `${topic}position/set`,
      availability_topic: `${topic}availability/state`,
      power_command_topic: `${topic}power/set`,
      pause_command_topic: `${topic}pause/set`,
      dock_command_topic: `${topic}dock/set`,
      start_mowing_command_topic: `${topic}start_mowing/set`,
      effect_state_topic: `${topic}effect/state`,
      effect_command_topic: `${topic}effect/set`,
      brightness_state_topic: `${topic}brightness/state`,
      brightness_command_topic: `${topic}brightness/set`,
      current_temperature_topic: `${topic}current_temperature`,
      current_humidity_topic: `${topic}current_humidity`,
      target_humidity_state_topic: `${topic}target_humidity/state`,
      target_humidity_command_topic: `${topic}target_humidity/set`,
      temperature_state_topic: `${topic}temperature/state`,
      temperature_command_topic: `${topic}temperature/set`,
      mode_state_topic: `${topic}mode/state`,
      mode_command_topic: `${topic}mode/set`,
      fan_mode_state_topic: `${topic}fan_mode/state`,
      fan_mode_command_topic: `${topic}fan_mode/set`,
      swing_mode_state_topic: `${topic}swing_mode/state`,
      swing_mode_command_topic: `${topic}swing_mode/set`,
      oscillation_state_topic: `${topic}oscillation/state`,
      oscillation_command_topic: `${topic}oscillation/set`,
      percentage_state_topic: `${topic}percentage/state`,
      percentage_command_topic: `${topic}percentage/set`,
      preset_mode_state_topic: `${topic}preset_mode/state`,
      preset_mode_command_topic: `${topic}preset_mode/set`,
      tilt_state_topic: `${topic}tilt/state`,
      tilt_status_topic: `${topic}tilt/status`,
      tilt_command_topic: `${topic}tilt/set`,
      battery_level_topic: `${topic}battery_level/state`,
      charging_topic: `${topic}charging/state`,
      cleaning_topic: `${topic}cleaning/state`,
      docked_topic: `${topic}docked/state`,
      error_topic: `${topic}error/state`,
      fan_speed_topic: `${topic}fan_speed/state`,
      set_fan_speed_topic: `${topic}set_fan_speed/set`,
      send_command_topic: `${topic}send_command/set`,
    }

    node.on('close', (removed, done) => {
      try {
        this.publish_availability(this.availability ? this.availability.payload_not_available : null)
        // The HA birth subscription is shared by all nodes, so it is released
        // only when the last node closes. Just drop this node's rediscovery hook.
        delete DiscoveryDevice[node.id]
        activeNodes--
        if (activeNodes <= 0) {
          activeNodes = 0
          statusSubscribed = false
        }
      } catch (ex) {
        // Ignore shutdown errors, Node-RED is tearing the flow down anyway.
      }
      if (typeof done === 'function') done()
    })
  }

  static get version() {
    return pk.version
  }

  static AutoDiscovery(nodes) {
    for (const node_id in DiscoveryDevice) {
      // delete empty nodes
      if (nodes && nodes.getNode(node_id) == null) {
        delete DiscoveryDevice[node_id]
        continue
      }
      DiscoveryDevice[node_id]()
    }
  }

  supportsVersion(minVersion) {
    if (!minVersion) return true
    if (!this.haVersion || this.haVersion === 'latest') return true
    return compareVersion(this.haVersion, minVersion) >= 0
  }

  customConfig() {
    const config = this.node.config
    if (!config) return {}
    if (typeof config === 'object') return config
    if (typeof config !== 'string' || !config.trim()) return {}
    try {
      const parsed = JSON.parse(config)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
    } catch (ex) {
      return {}
    }
  }

  publish_availability(payload) {
    if (!this.availability || !this.availability.enabled || !payload) return
    try {
      this.node.server.client.publish(this.availability.topic, payload, { retain: true })
    } catch (ex) {
      // A disconnected broker must not prevent discovery from being published.
    }
  }

  discovery(config, callback) {
    const type = this.node.type.replace('ha-mqtt-', '')
    if (!this.supportsVersion(PLATFORM_MIN_VERSION[type])) {
      this.node.status({
        fill: 'yellow',
        shape: 'ring',
        text: `HA ${this.haVersion} does not support ${type}; discovery skipped`
      })
      return
    }
    const node_id = this.node.id
    const baseConfig = Object.assign({}, config)
    DiscoveryDevice[node_id] = () => {
      // Re-read on every publish and never mutate the platform's own config:
      // HA birth messages can trigger this many times in a single flow.
      const mergeConfig = Object.assign({}, baseConfig, this.customConfig())
      this.publish_config(mergeConfig)
      if (typeof callback === 'function') callback()
    }
    if (!statusSubscribed) {
      statusSubscribed = true
      this.subscribe('homeassistant/status', (payload) => {
        if (payload === 'online') {
          HomeAssistant.AutoDiscovery()
        }
      })
    }
    // publish config
    DiscoveryDevice[node_id]()
  }

  publish_config(data) {
    const { name, unique_id, discovery_topic, state_topic, json_attr_t } = this.config
    const defaults = {
      name,
      unique_id,
      state_topic,
      json_attr_t,
      origin: ORIGIN,
      device: this.device_info
    }
    if (this.availability) {
      defaults.availability_topic = this.availability.topic
      defaults.payload_available = this.availability.payload_available
      defaults.payload_not_available = this.availability.payload_not_available
    }
    const mergeConfig = Object.assign({}, defaults, data)
    // Delete the property of NULL
    Object.keys(mergeConfig).forEach(key => {
      if (mergeConfig[key] === null) {
        delete mergeConfig[key]
      }
    })
    // Drop discovery attributes that the selected HA version does not know.
    Object.keys(mergeConfig).forEach(key => {
      if (ATTRIBUTE_MIN_VERSION[key] && !this.supportsVersion(ATTRIBUTE_MIN_VERSION[key])) {
        delete mergeConfig[key]
      }
    })
    // Remap legacy enum values that newer HA versions no longer accept.
    VALUE_RULES.forEach(rule => {
      if (rule.platform && this.config.discovery_topic.indexOf('/' + rule.platform + '/') === -1) return
      if (!this.supportsVersion(rule.min)) return
      const value = mergeConfig[rule.key]
      if (typeof value === 'string' && Object.prototype.hasOwnProperty.call(rule.map, value)) {
        mergeConfig[rule.key] = rule.map[value]
      }
    })
    this.publish(discovery_topic, mergeConfig)
    if (this.availability) {
      // A platform may opt out by nulling availability_topic (e.g. tag / device trigger).
      this.availability.enabled = Object.prototype.hasOwnProperty.call(mergeConfig, 'availability_topic')
      if (this.availability.enabled) {
        this.publish_availability(this.availability.payload_available)
      }
    }
  }

  subscribe(topic, callback) {
    this.node.server.subscribe(topic, { qos: 0 }, function (mtopic, mpayload, mpacket) {
      callback(mpayload.toString())
    })
  }

  send_payload(payload, i, len = 4) {
    let arr = []
    arr.length = len
    arr[i - 1] = { payload }
    this.node.send(arr)
  }

  publish(topic, payload, msg = "") {
    const type = Object.prototype.toString.call(payload)
    switch (type) {
      case '[object Null]':
      case '[object Undefined]':
        return
      case '[object Uint8Array]':
        this.node.server.client.publish(topic, payload, { retain: false })
        return;
      case '[object Object]':
      case '[object Array]':
        payload = JSON.stringify(payload)
        break;
      case '[object Number]':
      case '[object Boolean]':
        payload = String(payload)
        break;
    }

    this.node.server.client.publish(topic, payload, { retain: this.retain })
    if (msg) {
      this.node.status({ fill: "green", shape: "ring", text: `${msg}：${payload}` });
    }
  }

  isEmpty(value) {
    // 0 and false are perfectly valid entity states and must be published.
    return value === undefined || value === null || value === ''
  }
}
