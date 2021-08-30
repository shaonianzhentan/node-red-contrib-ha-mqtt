const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-device_automation', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            this.server.register(this)
            const ha = new HomeAssistant(this, cfg)
            const node = this
            node.on('input', function (msg) {
                const { payload } = msg
                try {
                    // 更新状态
                    if (payload) {
                        ha.publish_state(payload)
                    }
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: JSON.stringify(ex) });
                }
            })
            const { state_topic } = ha.config
            // 
            const typeList = ['button_short_press', 'button_short_release', 'button_long_press', 'button_long_release', 'button_double_press', 'button_triple_press', 'button_quadruple_press', 'button_quintuple_press']
            const subtypeList = ['button_1', 'button_2', 'button_3', 'button_4', 'button_5', 'button_6', 'button_2']
            ha.discovery({
                name: null,
                unique_id: null,
                state_topic: null,
                json_attr_t: null,
                automation_type: 'trigger',
                topic: state_topic,
                type: 'action',
                subtype: 'arrow_left_click',

            })
        } else {
            this.status({ fill: "red", shape: "ring", text: "未配置MQT" });
        }
    })
}