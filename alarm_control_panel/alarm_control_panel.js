const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-alarm_control_panel', function (cfg) {
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
                    node.status({ fill: "red", shape: "ring", text: ex });
                }
            })
            // 订阅主题
            ha.subscribe(ha.config.command_topic, (payload) => {
                node.send({ payload })
                // 改变状态
                ha.publish_state(payload)
            })

            ha.discovery({
                command_topic: ha.config.command_topic,
                payload_disarm: 'DISARM',
                payload_arm_home: 'ARM_HOME',
                payload_arm_away: 'ARM_AWAY',
                payload_arm_night: 'ARM_NIGHT'
            })
        } else {
            this.status({ fill: "red", shape: "ring", text: "未配置MQT" });
        }
    })
}