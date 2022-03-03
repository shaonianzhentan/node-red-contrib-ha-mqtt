const HomeAssistant = require('../HomeAssistant')
module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-device', function (cfg) {
        RED.nodes.createNode(this, cfg);
        let { name, config } = cfg
        name = name.trim()
        if (!name) {
            name = 'Home Assistant'
        }
        config = config ? JSON.parse(config) : {}
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