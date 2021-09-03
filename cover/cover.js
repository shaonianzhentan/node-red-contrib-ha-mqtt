const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-cover', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            this.server.register(this)
            const ha = new HomeAssistant(this, cfg)
            const node = this
            node.on('input', function (msg) {
                const { payload, attributes } = msg
                try {
                    // 更新状态
                    if (payload) {
                        ha.publish_state(payload)
                    }
                    // 更新属性
                    if (attributes) {
                        ha.publish_attributes(attributes)
                    }
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: JSON.stringify(ex) });
                }
            })
            const { command_topic, position_topic, tilt_command_topic, tilt_status_topic } = ha.config
            ha.discovery({
                command_topic,
                position_topic,
                tilt_command_topic,
                tilt_status_topic,
                tilt_min: 0,
                tilt_max: 180,
                tilt_closed_value: 70,
                tilt_opened_value: 180,
            })
        } else {
            this.status({ fill: "red", shape: "ring", text: "未配置MQT" });
        }
    })
}