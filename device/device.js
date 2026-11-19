const HomeAssistant = require('../HomeAssistant')
module.exports = function (RED) {
  RED.nodes.registerType('ha-mqtt-device', function (cfg) {
    RED.nodes.createNode(this, cfg);
    let { name, config, retain } = cfg
    name = typeof name === 'string' ? name.trim() : ''
    if (!name) {
      name = 'Home Assistant'
    }
    if (config && typeof config === 'object') {
      // already parsed
    } else {
      try {
        config = config ? JSON.parse(config) : {}
      } catch (ex) {
        config = {}
      }
    }
    this.retain = retain
    this.haVersion = cfg.haVersion || 'latest'
    this.device_info = {
      configuration_url: 'https://github.com/shaonianzhentan/node-red-contrib-ha-mqtt',
      identifiers: `ha-mqtt-${name}`,
      manufacturer: "shaonianzhentan",
      model: 'HA-MQTT',
      sw_version: HomeAssistant.version,
      ...config,
      name
    }
  })
}