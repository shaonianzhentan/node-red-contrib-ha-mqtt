const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-water_heater', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            this.server.register(this)
            const deviceNode = RED.nodes.getNode(cfg.device);
            const ha = new HomeAssistant(this, cfg, deviceNode.device_info)
            const node = this

            const {
                json_attr_t, mode_state_topic, mode_command_topic, power_command_topic,
                temperature_command_topic, temperature_state_topic,
                current_temperature_topic
            } = ha.config

            node.on('input', function (msg) {
                const { payload, attributes, mode, temperature } = msg
                try {
                    if (payload) {
                        ha.publish(current_temperature_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.current_temperature`))
                    }
                    if (attributes) {
                        ha.publish(json_attr_t, attributes, RED._(`node-red-contrib-ha-mqtt/common:publish.attributes`))
                    }
                    if (mode) {
                        ha.publish(mode_state_topic, mode, RED._(`node-red-contrib-ha-mqtt/common:publish.mode`))
                    }
                    if (temperature) {
                        ha.publish(temperature_state_topic, temperature, RED._(`node-red-contrib-ha-mqtt/common:publish.temperature`))
                    }
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: ex });
                }
            })
            ha.subscribe(temperature_command_topic, (payload) => {
                ha.send_payload(payload, 1, 3)
                ha.publish(temperature_state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.temperature`))
            })
            ha.subscribe(mode_command_topic, (payload) => {
                ha.send_payload(payload, 2, 3)
                ha.publish(mode_state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.mode`))
            })
            ha.subscribe(power_command_topic, (payload) => {
                ha.send_payload(payload, 3, 3)
            })
            try {
                ha.discovery({
                    state_topic: null,
                    power_command_topic,

                    mode_state_topic,
                    mode_command_topic,
                    temperature_state_topic,
                    temperature_command_topic,

                    current_temperature_topic
                }, () => {
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