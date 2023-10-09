const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-vacuum', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            this.server.register(this)
            const deviceNode = RED.nodes.getNode(cfg.device);
            const ha = new HomeAssistant(this, cfg, deviceNode)
            const node = this
            node.on('input', function (msg) {
                const { payload, attributes } = msg
                try {
                    if (payload) {
                        ha.publish(ha.config.state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.state`))
                    }
                    if (attributes) {
                        ha.publish(ha.config.json_attr_t, attributes, RED._(`node-red-contrib-ha-mqtt/common:publish.attributes`))
                    }
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: ex });
                }
            })
            const { command_topic, send_command_topic, set_fan_speed_topic, } = ha.config
            ha.subscribe(command_topic, (payload) => {
                ha.send_payload(payload, 1, 3)
                ha.publish(ha.config.state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.state`))
            })
            ha.subscribe(set_fan_speed_topic, (payload) => {
                ha.send_payload(payload, 2, 3)
                ha.publish(ha.config.fan_speed_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.fan_speed`))
            })
            ha.subscribe(send_command_topic, (payload) => {
                ha.send_payload(payload, 3, 3)
            })

            try {
                const discoveryConfig = {
                    command_topic,
                    send_command_topic,
                    set_fan_speed_topic,
                    fan_speed_list: ["min", "medium", "high", "max"],
                    supported_features: [
                        "turn_on", "turn_off", "pause", "stop", "return_home",
                        "battery", "status", "locate", "clean_spot", "fan_speed", "send_command"
                    ],
                }
                ha.discovery(discoveryConfig, () => {
                    this.status({ fill: "green", shape: "ring", text: `node-red-contrib-ha-mqtt/common:publish.config` });
                })
            } catch (ex) {
                this.status({ fill: "red", shape: "ring", text: `${ex}` });
            }
        } else {
            this.status({ fill: "red", shape: "ring", text: `node-red-contrib-ha-mqtt/common:errors.mqttNotConfigured` });
        }
    })
}