const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
  RED.nodes.registerType('ha-mqtt-climate', function (cfg) {
    RED.nodes.createNode(this, cfg);
    this.server = RED.nodes.getNode(cfg.server);
    if (this.server) {
      this.server.register(this)
      const deviceNode = RED.nodes.getNode(cfg.device);
      const ha = new HomeAssistant(this, cfg, deviceNode)
      const node = this

      const {
        json_attr_t, mode_state_topic, mode_command_topic, power_command_topic,
        fan_mode_command_topic, fan_mode_state_topic,
        swing_mode_command_topic, swing_mode_state_topic,
        temperature_command_topic, temperature_state_topic,
        current_temperature_topic, current_humidity_topic,
        target_humidity_state_topic, target_humidity_command_topic,
        preset_mode_command_topic, preset_mode_state_topic
      } = ha.config

      node.on('input', function (msg) {
        const { payload, attributes, mode, temperature, current_humidity, target_humidity, swing_mode, fan_mode, preset_mode } = msg
        try {
          if (payload) {
            ha.publish(current_temperature_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.current_temperature`))
          }
          if (attributes) {
            ha.publish(json_attr_t, attributes, RED._(`node-red-contrib-ha-mqtt/common:publish.attributes`))
          }
          if (mode) {
            ha.publish(mode_state_topic, mode, RED._(`node-red-contrib-ha-mqtt/common:publish.mode`))
          }
          if (temperature) {
            ha.publish(temperature_state_topic, temperature, RED._(`node-red-contrib-ha-mqtt/common:publish.temperature`))
          }
          if (current_humidity) {
            ha.publish(current_humidity_topic, current_humidity, RED._(`node-red-contrib-ha-mqtt/common:publish.current_humidity`))
          }
          if (target_humidity) {
            ha.publish(target_humidity_state_topic, target_humidity, RED._(`node-red-contrib-ha-mqtt/common:publish.target_humidity`))
          }
          if (swing_mode) {
            ha.publish(swing_mode_state_topic, swing_mode, RED._(`node-red-contrib-ha-mqtt/common:publish.swing_mode`))
          }
          if (fan_mode) {
            ha.publish(fan_mode_state_topic, fan_mode, RED._(`node-red-contrib-ha-mqtt/common:publish.fan_mode`))
          }
          if (preset_mode) {
            ha.publish(preset_mode_state_topic, preset_mode, RED._(`node-red-contrib-ha-mqtt/common:publish.preset_mode`))
          }
        } catch (ex) {
          node.status({ fill: "red", shape: "ring", text: ex });
        }
      })
      ha.subscribe(temperature_command_topic, (payload) => {
        ha.send_payload(payload, 1, 6)
        ha.publish(temperature_state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.temperature`))
      })
      ha.subscribe(mode_command_topic, (payload) => {
        ha.send_payload(payload, 2, 6)
        ha.publish(mode_state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.mode`))
      })
      ha.subscribe(swing_mode_command_topic, (payload) => {
        ha.send_payload(payload, 3, 6)
        ha.publish(swing_mode_state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.swing_mode`))
      })
      ha.subscribe(fan_mode_command_topic, (payload) => {
        ha.send_payload(payload, 4, 6)
        ha.publish(fan_mode_state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.fan_mode`))
      })
      ha.subscribe(target_humidity_command_topic, (payload) => {
        ha.send_payload(payload, 5, 6)
        ha.publish(target_humidity_state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.target_humidity`))
      })
      ha.subscribe(preset_mode_command_topic, (payload) => {
        ha.send_payload(payload, 6, 6)
        ha.publish(preset_mode_state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.preset_mode`))
      })

      try {
        const discoveryConfig = {
          state_topic: null,
          current_temperature_topic,
          current_humidity_topic,
          power_command_topic,
          temperature_command_topic,
          temperature_state_topic,
          precision: 1,
          target_humidity_command_topic,
          target_humidity_state_topic,
          swing_mode_command_topic,
          swing_mode_state_topic,
          swing_modes: ["on", "off"],
          mode_command_topic,
          mode_state_topic,
          modes: ["auto", "off", "cool", "heat", "dry", "fan_only"],
          fan_mode_command_topic,
          fan_mode_state_topic,
          fan_modes: ["auto", "low", "medium", "high"]
        }
        // Enable Preset Mode
        if (cfg.preset_mode) {
          Object.assign(discoveryConfig, {
            preset_mode_command_topic,
            preset_mode_state_topic,
            preset_modes: [
              'eco', 'away', 'boost', 'comfort', 'home', 'sleep', 'activity'
            ]
          })
        }

        ha.discovery(discoveryConfig, () => {
          this.status({ fill: "green", shape: "ring", text: `node-red-contrib-ha-mqtt/common:publish.config` });
        })
      } catch (ex) {
        this.status({ fill: "red", shape: "ring", text: `${ex}` });
      }
    } else {
      this.status({ fill: "red", shape: "ring", text: `node-red-contrib-ha-mqtt/common:errors.mqttNotConfigured` });
    }
  })
}