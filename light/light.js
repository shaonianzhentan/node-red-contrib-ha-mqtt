const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-light', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            this.server.register(this)
            const ha = new HomeAssistant(this, cfg)
            const node = this
            const { command_topic, effect_command_topic, brightness_command_topic } = ha.config
            node.on('input', function (msg) {
                const { config, state, attributes } = msg
                try {
                    // 更新配置
                    if (config && typeof config === 'object') {
                        ha.publish_config(Object.assign({
                            effect_command_topic,
                            brightness_command_topic,
                            command_topic,
                            schema: "json",
                            payload_on: "ON",
                            payload_off: "OFF",
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
            ha.subscribe(command_topic, (payload) => {
                console.log(payload)
                // node.send([payload, null])
                // 改变状态
                // ha.publish_state(payload)
            })
            ha.subscribe(effect_command_topic, (payload) => {
                console.log(payload)
            })
            ha.subscribe(brightness_command_topic, (payload) => {
                console.log(payload)
            })
        } else {
            this.status({ fill: "red", shape: "ring", text: "未配置MQT" });
        }
    })
}