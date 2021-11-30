const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-humidifier', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            this.server.register(this)
            const ha = new HomeAssistant(this, cfg)
            const node = this
            node.on('input', function (msg) {
                const { payload, attributes, mode, target_humidity } = msg
                try {
                    // 更新状态
                    if (payload) {
                        ha.publish_state(payload)
                    }
                    // 更新属性
                    if (attributes) {
                        ha.publish_attributes(attributes)
                    }
                    if (mode) {
                        ha.publish_mode(mode)
                    }
                    if (target_humidity) {
                        ha.publish_target_humidity(target_humidity)
                    }
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: ex });
                }
            })
            const { command_topic, target_humidity_command_topic, target_humidity_state_topic,
                mode_state_topic, mode_command_topic } = ha.config
            // 订阅主题
            ha.subscribe(command_topic, (payload) => {
                ha.send_payload(payload, 1, 3)
                ha.publish_state(payload)
            })
            ha.subscribe(target_humidity_command_topic, (payload) => {
                ha.send_payload(payload, 2, 3)
                ha.publish_target_humidity(payload)
            })
            ha.subscribe(mode_command_topic, (payload) => {
                ha.send_payload(payload, 3, 3)
                ha.publish_mode(payload)
            })
            ha.discovery({
                command_topic,
                target_humidity_command_topic,
                target_humidity_state_topic,
                mode_state_topic,
                mode_command_topic,
                device_class: "humidifier",
                modes: ["normal", "eco", "away", "boost", "comfort", "home", "sleep", "auto", "baby"],
                min_humidity: 30,
                max_humidity: 80
            })
        } else {
            this.status({ fill: "red", shape: "ring", text: "MQTT Unconfigured" });
        }
    })
}