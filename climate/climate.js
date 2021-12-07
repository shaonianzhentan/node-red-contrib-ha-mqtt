const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-climate', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            this.server.register(this)
            const ha = new HomeAssistant(this, cfg)
            const node = this
            node.on('input', function (msg) {
                const { payload, attributes, mode, temperature } = msg
                try {
                    if (payload) {
                        ha.publish(ha.config.current_temperature_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.current_temperature`))
                    }
                    if (attributes) {
                        ha.publish(ha.config.json_attr_t, attributes, RED._(`node-red-contrib-ha-mqtt/common:publish.attributes`))
                    }
                    if (mode) {
                        ha.publish(ha.config.mode_state_topic, mode, RED._(`node-red-contrib-ha-mqtt/common:publish.mode`))
                    }
                    if (temperature) {
                        ha.publish(ha.config.temperature_state_topic, temperature, RED._(`node-red-contrib-ha-mqtt/common:publish.temperature`))
                    }
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: ex });
                }
            })
            const { mode_state_topic, mode_command_topic, power_command_topic,
                fan_mode_command_topic, swing_mode_command_topic,
                current_temperature_topic,
                temperature_state_topic,
                temperature_command_topic } = ha.config

            ha.subscribe(temperature_command_topic, (payload) => {
                ha.send_payload(payload, 1, 4)
                ha.publish(ha.config.temperature_state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.temperature`))
            })
            ha.subscribe(mode_command_topic, (payload) => {
                ha.send_payload(payload, 2, 4)
                ha.publish(ha.config.mode_state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.mode`))
            })
            ha.subscribe(swing_mode_command_topic, (payload) => {
                ha.send_payload(payload, 3, 4)
                ha.publish(ha.config.swing_mode_state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.swing_mode`))
            })
            ha.subscribe(fan_mode_command_topic, (payload) => {
                ha.send_payload(payload, 4, 4)
                ha.publish(ha.config.fan_mode_state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.fan_mode`))
            })
            try {
                ha.discovery({
                    state_topic: null,
                    power_command_topic,
                    mode_state_topic,
                    temperature_state_topic,
                    current_temperature_topic,
                    precision: 1,
                    temperature_command_topic,
                    mode_command_topic,
                    fan_mode_command_topic,
                    swing_mode_command_topic,
                    swing_modes: ["on", "off"],
                    modes: ["auto", "off", "cool", "heat", "dry", "fan_only"],
                    fan_modes: ["auto", "low", "medium", "high"]
                })
                this.status({ fill: "green", shape: "ring", text: `node-red-contrib-ha-mqtt/common:publish.config` });
            } catch (ex) {
                this.status({ fill: "red", shape: "ring", text: `${ex}` });
            }
        } else {
            this.status({ fill: "red", shape: "ring", text: `node-red-contrib-ha-mqtt/common:errors.mqttNotConfigured` });
        }
    })
}