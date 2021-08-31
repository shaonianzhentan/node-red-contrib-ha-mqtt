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
                    // 更新状态
                    if (payload) {
                        ha.publish_state(payload)
                    }
                    // 更新属性
                    if (attributes) {
                        ha.publish_attributes(attributes)
                    }
                    if (preset_mode) {
                        ha.publish_preset_mode(preset_mode)
                    }
                    if (percentage) {
                        ha.publish_percentage(percentage)
                    }
                    if (oscillation) {
                        ha.publish_oscillation(oscillation)
                    }
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: ex });
                }
            })
            const { command_topic, oscillation_state_topic, oscillation_command_topic,
                percentage_state_topic, percentage_command_topic,
                preset_mode_state_topic, preset_mode_command_topic } = ha.config
            // 开关
            ha.subscribe(command_topic, (payload) => {
                ha.send_payload(payload, 1, 4)
                ha.publish_state(payload)
            })
            ha.subscribe(oscillation_command_topic, (payload) => {
                ha.send_payload(payload, 2, 4)
                ha.publish_oscillation(payload)
            })
            ha.subscribe(percentage_command_topic, (payload) => {
                ha.send_payload(payload, 3, 4)
                ha.publish_percentage(payload)
            })
            ha.subscribe(preset_mode_command_topic, (payload) => {
                ha.send_payload(payload, 4, 4)
                ha.publish_preset_mode(payload)
            })

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
        } else {
            this.status({ fill: "red", shape: "ring", text: "未配置MQT" });
        }
    })
}