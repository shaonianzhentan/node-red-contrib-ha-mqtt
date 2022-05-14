const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-discovery', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            this.server.register(this)
            const node = this
            node.on('input', function (msg) {
                HomeAssistant.AutoDiscovery(RED.nodes)
                this.status({ fill: "green", shape: "ring", text: `${new Date().toLocaleTimeString()} ${RED._("autoDiscoverySent")}` });
            })
        } else {
            this.status({ fill: "red", shape: "ring", text: `node-red-contrib-ha-mqtt/common:errors.mqttNotConfigured` });
        }
    })
}