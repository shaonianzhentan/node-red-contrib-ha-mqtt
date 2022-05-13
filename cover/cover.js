const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-cover', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            this.server.register(this)
            const deviceNode = RED.nodes.getNode(cfg.device);
            const ha = new HomeAssistant(this, cfg, deviceNode.device_info)
            const { command_topic, state_topic, set_position_topic, position_topic, tilt_command_topic, tilt_status_topic } = ha.config
            const node = this
            node.on('input', function (msg) {
                const { payload, attributes, position, tilt } = msg
                try {
                    if (payload) {
                        ha.publish(state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.state`))
                    }
                    if (attributes) {
                        ha.publish(ha.config.json_attr_t, attributes, RED._(`node-red-contrib-ha-mqtt/common:publish.attributes`))
                    }
                    if (typeof position === 'number') {
                        ha.publish(position_topic, position, RED._(`node-red-contrib-ha-mqtt/common:publish.position`))
                    }
                    if (typeof tilt === 'number') {
                        ha.publish(tilt_status_topic, tilt, RED._(`node-red-contrib-ha-mqtt/common:publish.tilt`))
                    }
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: JSON.stringify(ex) });
                }
            })
            ha.subscribe(command_topic, (payload) => {
                ha.send_payload(payload.toLocaleLowerCase(), 1, 3)
                if (payload === 'CLOSE') payload = 'closing'
                else if (payload === 'OPEN') payload = 'opening'
                else if (payload === 'STOP') payload = 'stopped'
                ha.publish(state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.state`))
            })
            ha.subscribe(set_position_topic, (payload) => {
                ha.send_payload(payload, 2, 3)
                ha.publish(position_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.position`))
            })
            ha.subscribe(tilt_command_topic, (payload) => {
                ha.send_payload(payload, 3, 3)
                ha.publish(tilt_status_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.tilt`))
            })

            try {
                const discoveryConfig = {
                    command_topic,
                    set_position_topic,
                    position_topic,
                    tilt_command_topic,
                    tilt_status_topic,
                    tilt_min: 0,
                    tilt_max: 100,
                    tilt_closed_value: 0,
                    tilt_opened_value: 100
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