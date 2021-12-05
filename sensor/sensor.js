const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-sensor', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            this.server.register(this)
            cfg.device = RED.nodes.getNode(cfg.device);
            const ha = new HomeAssistant(this, cfg)
            const node = this
            node.on('input', function (msg) {
                const { payload, attributes } = msg
                try {
                    if (typeof payload !== 'undefined') {
                        ha.publish_state(payload)
                    }
                    if (typeof attributes !== 'undefined') {
                        ha.publish_attributes(attributes)
                    }

                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: JSON.stringify(ex) });
                }
            })

            ha.discovery({
                device_class: cfg.device_class === "" ? null : cfg.device_class,
                unit_of_measurement: cfg.unit_of_measurement
            })
        } else {
            this.status({ fill: "red", shape: "ring", text: "MQTT Unconfigured" });
        }
    })
}