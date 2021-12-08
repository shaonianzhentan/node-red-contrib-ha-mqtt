const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-device', function (cfg) {
        RED.nodes.createNode(this, cfg);
        const { name } = cfg
        this.device_info = {
            name,
            identifiers: ['635147515-shaonianzhentan', name],
            manufacturer: "shaonianzhentan",
            model: 'HA-MQTT',
            sw_version: pk.version
        }
    })
}