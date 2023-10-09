const HomeAssistant = require('../HomeAssistant')
const gcoord = require('gcoord')

module.exports = function (RED) {
  RED.nodes.registerType('ha-mqtt-device_tracker', function (cfg) {
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
            // Converting China Map Coordinate System to GPS
            if (attributes.gcoord) {
              const { longitude, latitude } = attributes
              let result = null
              switch (attributes.gcoord) {
                case 'GCJ02':
                  result = gcoord.transform([longitude, latitude], gcoord.GCJ02, gcoord.WGS84);
                  break;
                case 'BD09':
                  result = gcoord.transform([longitude, latitude], gcoord.BD09, gcoord.WGS84);
                  break;
              }
              if (result) {
                attributes.gcoord_lng = longitude
                attributes.gcoord_lat = latitude
                attributes.longitude = result[0]
                attributes.latitude = result[1]
              }
            }
            ha.publish(ha.config.json_attr_t, attributes, RED._(`node-red-contrib-ha-mqtt/common:publish.attributes`))
          }
        } catch (ex) {
          node.status({ fill: "red", shape: "ring", text: JSON.stringify(ex) });
        }
      })

      try {
        const discoveryConfig = {}
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