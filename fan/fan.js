const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-fan', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            this.server.register(this)
            const ha = new HomeAssistant(this, cfg)
            const node = this
            node.on('input', function (msg) {
                const { payload, attributes, preset_mode, percentage, oscillation } = msg
                try {
                    if (payload) {
                        ha.publish(ha.config.state_topic, payload, RED._(`${HomeAssistant.pkName}/common:publish.state`))
                    }
                    if (attributes) {
                        ha.publish(ha.config.json_attr_t, attributes, RED._(`${HomeAssistant.pkName}/common:publish.attributes`))
                    }
                    if (preset_mode) {
                        ha.publish(ha.config.preset_mode_state_topic, preset_mode, RED._(`${HomeAssistant.pkName}/common:publish.preset_mode`))
                    }
                    if (percentage) {
                        ha.publish(ha.config.percentage_state_topic, percentage, RED._(`${HomeAssistant.pkName}/common:publish.percentage`))                    
                    }
                    if (oscillation) {
                        ha.publish(ha.config.oscillation_state_topic, oscillation, RED._(`${HomeAssistant.pkName}/common:publish.oscillation`))
                    }
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: ex });
                }
            })
            const { command_topic, oscillation_state_topic, oscillation_command_topic,
                percentage_state_topic, percentage_command_topic,
                preset_mode_state_topic, preset_mode_command_topic } = ha.config
            ha.subscribe(command_topic, (payload) => {
                ha.send_payload(payload, 1, 4)
                ha.publish(ha.config.state_topic, payload, RED._(`${HomeAssistant.pkName}/common:publish.state`))
            })
            ha.subscribe(oscillation_command_topic, (payload) => {
                ha.send_payload(payload, 2, 4)
                ha.publish(ha.config.oscillation_state_topic, payload, RED._(`${HomeAssistant.pkName}/common:publish.oscillation`))
            })
            ha.subscribe(percentage_command_topic, (payload) => {
                ha.send_payload(payload, 3, 4)
                ha.publish(ha.config.percentage_state_topic, payload, RED._(`${HomeAssistant.pkName}/common:publish.percentage`))                    
            })
            ha.subscribe(preset_mode_command_topic, (payload) => {
                ha.send_payload(payload, 4, 4)
                ha.publish(ha.config.preset_mode_state_topic, payload, RED._(`${HomeAssistant.pkName}/common:publish.preset_mode`))
            })

            try {
                ha.discovery({
                    command_topic,
                    oscillation_state_topic,
                    oscillation_command_topic,
                    percentage_state_topic,
                    percentage_command_topic,
                    preset_mode_state_topic,
                    preset_mode_command_topic,
                    preset_modes: ["auto", "smart", "whoosh", "eco", "breeze"],
                    speed_range_min: 1,
                    speed_range_max: 10
                })
                this.status({ fill: "green", shape: "ring", text: `${HomeAssistant.pkName}/common:publish.config` });
            } catch (ex) {
                this.status({ fill: "red", shape: "ring", text: `${ex}` });
            }
        } else {
            this.status({ fill: "red", shape: "ring", text: `${HomeAssistant.pkName}/common:error.mqttNotConfigured` });
        }
    })
}