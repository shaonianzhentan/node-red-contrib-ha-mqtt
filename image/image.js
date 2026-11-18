const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
  RED.nodes.registerType('ha-mqtt-image', function (cfg) {
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
          if (!ha.isEmpty(payload)) {
            ha.publish(ha.config.state_topic, payload, RED._(`node-red-contrib-ha-mqtt/common:publish.state`))
          }
          if (attributes) {
            ha.publish(ha.config.json_attr_t, attributes, RED._(`node-red-contrib-ha-mqtt/common:publish.attributes`))
          }
        } catch (ex) {
          node.status({ fill: "red", shape: "ring", text: JSON.stringify(ex) });
        }
      })
      const { state_topic } = ha.config

      try {
        const discoveryConfig = {
          state_topic: null,
          url_topic: state_topic
        }

        // 非URL链接
        const customConfig = ha.customConfig()
        if (customConfig.content_type) {
          discoveryConfig.url_topic = null
          discoveryConfig.image_topic = state_topic
          discoveryConfig.content_type = customConfig.content_type
        }

        ha.discovery(discoveryConfig, () => {
          this.status({ fill: "green", shape: "ring", text: RED._('node-red-contrib-ha-mqtt/common:publish.config') });
        })
      } catch (ex) {
        this.status({ fill: "red", shape: "ring", text: `${ex}` });
      }
    } else {
      this.status({ fill: "red", shape: "ring", text: RED._('node-red-contrib-ha-mqtt/common:errors.mqttNotConfigured') });
    }
  })
}