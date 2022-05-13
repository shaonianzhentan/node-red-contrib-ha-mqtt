const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-light', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            this.server.register(this)
            const deviceNode = RED.nodes.getNode(cfg.device);
            const ha = new HomeAssistant(this, cfg, deviceNode.device_info)
            const node = this
            const { command_topic, effect_state_topic, effect_command_topic, brightness_state_topic, brightness_command_topic } = ha.config
            node.on('input', function (msg) {
                const { payload, attributes, effect, brightness } = msg
                try {
                    if (payload) {
                        ha.publish(ha.config.state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.state`))
                    }
                    if (attributes) {
                        ha.publish(ha.config.json_attr_t, attributes, RED._(`node-red-contrib-ha-mqtt/common:publish.attributes`))
                    }
                    if (effect) {
                        ha.publish(ha.config.effect_state_topic, effect, RED._(`node-red-contrib-ha-mqtt/common:publish.effect`))
                    }
                    if (brightness) {
                        ha.publish(ha.config.brightness_state_topic, brightness, RED._(`node-red-contrib-ha-mqtt/common:publish.brightness`))
                    }
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: ex });
                }
            })
            ha.subscribe(command_topic, (payload) => {
                ha.send_payload(payload, 1, 3)
                ha.publish(ha.config.state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.state`))
            })
            ha.subscribe(brightness_command_topic, (payload) => {
                ha.send_payload(payload, 2, 3)
                ha.publish(ha.config.brightness_state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.brightness`))
            })
            ha.subscribe(effect_command_topic, (payload) => {
                ha.send_payload(payload, 3, 3)
                ha.publish(ha.config.effect_state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.effect`))
            })

            try {
                const discoveryConfig = {
                    command_topic,
                    effect_state_topic,
                    effect_command_topic,
                    brightness_state_topic,
                    brightness_command_topic,
                    payload_on: "ON",
                    payload_off: "OFF",
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