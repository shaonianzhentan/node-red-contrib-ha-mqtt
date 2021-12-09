const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-button', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            this.server.register(this)
            const ha = new HomeAssistant(this, cfg)
            const { json_attr_t, command_topic } = ha.config
            const node = this
            node.on('input', function (msg) {
                const { attributes } = msg
                try {
                    if (attributes) {
                        ha.publish(json_attr_t, attributes, RED._(`node-red-contrib-ha-mqtt/common:publish.attributes`))
                    }
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: JSON.stringify(ex) });
                }
            })
            ha.subscribe(command_topic, (payload) => {
                node.send({ payload })
            })
            try {
                const discoveryConfig = {
                    state_topic: null,
                    command_topic
                }
                if (cfg.device) {
                    const deviceNode = RED.nodes.getNode(cfg.device);
                    discoveryConfig['device'] = deviceNode.device_info
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