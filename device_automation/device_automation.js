const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-device_automation', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            this.server.register(this)
            // 格式化名称值，保证name值唯一
            const subtype = cfg.name
            cfg.name = `${cfg.subtype}${cfg.action}`
            const ha = new HomeAssistant(this, cfg)
            const node = this
            const { state_topic } = ha.config
            node.on('input', function (msg) {
                const { payload } = msg
                try {
                    // 更新状态
                    if (payload) {
                        ha.publish_state(subtype)
                    }
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: JSON.stringify(ex) });
                }
            })
            ha.discovery({
                name: null,
                unique_id: null,
                state_topic: null,
                json_attr_t: null,
                automation_type: 'trigger',
                topic: state_topic,
                type: cfg.action,
                subtype
            })
        } else {
            this.status({ fill: "red", shape: "ring", text: "未配置MQT" });
        }
    })
}