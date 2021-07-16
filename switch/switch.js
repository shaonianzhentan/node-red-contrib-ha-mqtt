const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-switch', function (config) {
        RED.nodes.createNode(this, config);
        this.server = RED.nodes.getNode(config.server);
        if (this.server) {
            this.server.register(this)
            const ha = new HomeAssistant(this, config, () => {
                return {
                    command_topic: ha.config.command_topic,
                    payload_on: "ON",
                    payload_off: "OFF",
                    state_on: "ON",
                    state_off: "OFF"
                }
            })
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
                    node.status({ fill: "red", shape: "ring", text: ex });
                }
            })
            // 订阅主题
            ha.subscribe(ha.config.command_topic, (payload) => {
                node.send({ payload })
                // 改变状态
                ha.publish_state(payload)
            })
        } else {
            this.status({ fill: "red", shape: "ring", text: "未配置MQT" });
        }
    })
}