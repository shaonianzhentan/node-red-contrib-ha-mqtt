const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
  RED.nodes.registerType('ha-mqtt-lawn_mower', function (cfg) {
    RED.nodes.createNode(this, cfg);
    this.server = RED.nodes.getNode(cfg.server);
    if (this.server) {
      this.server.register(this)
      const deviceNode = RED.nodes.getNode(cfg.device);
      const ha = new HomeAssistant(this, cfg, deviceNode.device_info)

      const { state_topic, pause_command_topic, dock_command_topic, start_mowing_command_topic } = ha.config

      const node = this
      node.on('input', function (msg) {
        const { payload, attributes } = msg
        try {
          if (payload) {
            ha.publish(state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.state`))
          }
          if (attributes) {
            ha.publish(ha.config.json_attr_t, attributes, RED._(`node-red-contrib-ha-mqtt/common:publish.attributes`))
          }
        } catch (ex) {
          node.status({ fill: "red", shape: "ring", text: ex });
        }
      })

      ha.subscribe(start_mowing_command_topic, (payload) => {
        ha.send_payload(payload, 1, 3)

        ha.publish(state_topic, 'mowing', RED._(`node-red-contrib-ha-mqtt/common:publish.state`))
      })
      ha.subscribe(pause_command_topic, (payload) => {
        ha.send_payload(payload, 2, 3)

        ha.publish(state_topic, 'paused', RED._(`node-red-contrib-ha-mqtt/common:publish.state`))
      })
      ha.subscribe(dock_command_topic, (payload) => {
        ha.send_payload(payload, 3, 3)

        ha.publish(state_topic, 'docked', RED._(`node-red-contrib-ha-mqtt/common:publish.state`))
      })

      try {
        const discoveryConfig = {
          state_topic: null,
          activity_state_topic: state_topic,
          pause_command_topic,
          dock_command_topic,
          start_mowing_command_topic
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