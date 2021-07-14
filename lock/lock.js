const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-lock', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            this.server.register(this)
            const ha = new HomeAssistant(this, cfg)
            const node = this
            node.on('input', function (msg) {
                const { config, state, attributes } = msg
                try {
                    // 更新配置
                    if (config && typeof config === 'object') {
                        ha.publish_config(Object.assign({
                            command_topic: ha.config.command_topic,
                            payload_lock: "LOCK",
                            payload_unlock: "UNLOCK",
                            state_locked: "LOCK",
                            state_unlocked: "UNLOCK",
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
                node.send({ payload })
                // 改变状态
                ha.publish_state(payload)
            })
        } else {
            this.status({ fill: "red", shape: "ring", text: "未配置MQT" });
        }
    })
}