const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-switch', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            this.server.register(this)
            const ha = new HomeAssistant(this, cfg)
            const node = this
            node.on('input', function (msg) {
                const { payload, attributes } = msg
                try {
                    if (payload) {
                        ha.publish(ha.config.state_topic, payload, RED._(`${HomeAssistant.pkName}/common:publish.state`))
                    }
                    if (attributes) {
                        ha.publish(ha.config.json_attr_t, attributes, RED._(`${HomeAssistant.pkName}/common:publish.attributes`))
                    }
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: ex });
                }
            })
            ha.subscribe(ha.config.command_topic, (payload) => {
                node.send({ payload })
                ha.publish(ha.config.state_topic, payload, RED._(`${HomeAssistant.pkName}/common:publish.state`))
            })

            try {
                ha.discovery({
                    command_topic: ha.config.command_topic,
                    payload_on: "ON",
                    payload_off: "OFF",
                    state_on: "ON",
                    state_off: "OFF"
                })
                this.status({ fill: "green", shape: "ring", text: `${HomeAssistant.pkName}/common:publish.config` });
            } catch (ex) {
                this.status({ fill: "red", shape: "ring", text: `${ex}` });
            }
        } else {
            this.status({ fill: "red", shape: "ring", text: `${HomeAssistant.pkName}/common:error.mqttNotConfigured` });
        }
    })
}