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
                    if (payload) {
                        ha.publish(ha.config.state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.state`))
                    }
                    if (attributes) {
                        ha.publish(ha.config.json_attr_t, attributes, RED._(`node-red-contrib-ha-mqtt/common:publish.attributes`))
                    }
                    if (mode) {
                        ha.publish(ha.config.mode_state_topic, mode, RED._(`node-red-contrib-ha-mqtt/common:publish.mode`))
                    }
                    if (target_humidity) {
                        ha.publish(ha.config.target_humidity_state_topic, target_humidity, RED._(`node-red-contrib-ha-mqtt/common:publish.target_humidity`))
                    }
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: ex });
                }
            })
            const { command_topic, target_humidity_command_topic, target_humidity_state_topic,
                mode_state_topic, mode_command_topic } = ha.config
            ha.subscribe(command_topic, (payload) => {
                ha.send_payload(payload, 1, 3)
                ha.publish(ha.config.state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.state`))
            })
            ha.subscribe(target_humidity_command_topic, (payload) => {
                ha.send_payload(payload, 2, 3)
                ha.publish(ha.config.target_humidity_state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.target_humidity`))
            })
            ha.subscribe(mode_command_topic, (payload) => {
                ha.send_payload(payload, 3, 3)
                ha.publish(ha.config.mode_state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.mode`))
            })

            try {
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
                this.status({ fill: "green", shape: "ring", text: `node-red-contrib-ha-mqtt/common:publish.config` });
            } catch (ex) {
                this.status({ fill: "red", shape: "ring", text: `${ex}` });
            }
        } else {
            this.status({ fill: "red", shape: "ring", text: `node-red-contrib-ha-mqtt/common:errors.mqttNotConfigured` });
        }
    })
}