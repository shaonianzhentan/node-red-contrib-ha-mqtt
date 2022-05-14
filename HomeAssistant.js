const fs = require('fs')
const pinyin = require("node-pinyin")

const pk = JSON.parse(fs.readFileSync(__dirname + '/package.json', 'utf-8'))

function object_id(name) {
    let arr = pinyin(name, { style: 'normal' })
    return arr.map(ele => ele[0]).join('_')
}

const DiscoveryDevice = {}
module.exports = class HomeAssistant {
    constructor(node, cfg, device_info) {
        this.device_info = device_info
        node.config = cfg.config
        this.node = node
        const { name } = cfg
        const entity_id = object_id(name)
        const type = node.type.replace('ha-mqtt-', '')
        const topic = `ha-mqtt/${type}/${entity_id}/`
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
            effect_state_topic: `${topic}effect/state`,
            effect_command_topic: `${topic}effect/set`,
            brightness_state_topic: `${topic}brightness/state`,
            brightness_command_topic: `${topic}brightness/set`,
            current_temperature_topic: `${topic}current_temperature`,
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

    discovery(config, callback) {
        const node_id = this.node.id
        DiscoveryDevice[node_id] = () => {
            if (this.node.config) {
                config = Object.assign(config, JSON.parse(this.node.config))
            }
            this.publish_config(config)
            callback()
        }
        this.subscribe('homeassistant/status', (payload) => {
            if (payload === 'online') {
                HomeAssistant.AutoDiscovery()
            }
        })
        // publish config
        DiscoveryDevice[node_id]()
    }

    publish_config(data) {
        const { name, unique_id, discovery_topic, state_topic, json_attr_t } = this.config
        const mergeConfig = Object.assign({
            name,
            unique_id,
            state_topic,
            json_attr_t,
            device: this.device_info
        }, data)
        // Delete the property of NULL
        Object.keys(mergeConfig).forEach(key => {
            if (mergeConfig[key] === null) {
                delete mergeConfig[key]
            }
        })
        this.publish(discovery_topic, mergeConfig)
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
            case '[object Uint8Array]':
                this.node.server.client.publish(topic, payload, { retain: false })
                return;
            case '[object Object]':
                payload = JSON.stringify(payload)
                break;
            case '[object Number]':
                payload = String(payload)
                break;
        }
        this.node.server.client.publish(topic, payload)
        if (msg) {
            this.node.status({ fill: "green", shape: "ring", text: `${msg}：${payload}` });
        }
    }
}