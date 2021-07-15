const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-binary_sensor', function (config) {
        RED.nodes.createNode(this, config);
        this.server = RED.nodes.getNode(config.server);
        if (this.server) {
            this.server.register(this)
            const ha = new HomeAssistant(this, config)
            const node = this
            node.on('input', function (msg) {
                const { config, payload, attributes } = msg
                try {
                    // 更新配置
                    if (config && typeof config === 'object') {
                        ha.publish_config(Object.assign({ device_class: "motion" }, config))
                    }
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
        } else {
            this.status({ fill: "red", shape: "ring", text: "未配置MQT" });
        }
    })
}