const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-switch', function (config) {
        RED.nodes.createNode(this, config);
        this.server = RED.nodes.getNode(config.server);
        if (this.server) {
            this.server.register(this)
            const ha = new HomeAssistant(this, config)
            const node = this
            node.on('input', function (msg) {
                const { config, state, attributes } = msg
                try {
                    // 更新配置
                    if (config && typeof config === 'object') {
                        ha.publish_config(Object.assign({
                            command_topic: ha.config.command_topic,
                            payload_on: "ON",
                            payload_off: "OFF",
                            state_on: "ON",
                            state_off: "OFF"
                        }, config))
                    }
                    // 更新状态
                    if (state) {
                        ha.publish_state(state)
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
                node.send({ payload, state: payload })
            })
        } else {
            this.status({ fill: "red", shape: "ring", text: "未配置MQT" });
        }
    })
}