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
                        // ha.publish_state(payload)
                        ha.publish_current_temperature(payload)
                    }
                    if (attributes) {
                        ha.publish_attributes(attributes)
                    }
                    if (mode) {
                        ha.publish_mode(mode)
                    }
                    if (temperature) {
                        ha.publish_temperature(temperature)
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
                ha.publish_temperature(payload)
            })
            ha.subscribe(mode_command_topic, (payload) => {
                ha.send_payload(payload, 2, 4)
                ha.publish_mode(payload)
            })
            ha.subscribe(swing_mode_command_topic, (payload) => {
                ha.send_payload(payload, 3, 4)
                ha.publish_swing_mode(payload)
            })
            ha.subscribe(fan_mode_command_topic, (payload) => {
                ha.send_payload(payload, 4, 4)
                ha.publish_fan_mode(payload)
            })

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
        } else {
            this.status({ fill: "red", shape: "ring", text: "MQTT Unconfigured" });
        }
    })
}