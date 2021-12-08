module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-device', function (cfg) {
        RED.nodes.createNode(this, cfg);
        let { name } = cfg
        name = name.trim()
        if (!name) {
            name = 'Home Assistant'
        }
        this.device_info = {
            name,
            identifiers: ['shaonianzhentan', 'ha-mqtt', name],
            manufacturer: "shaonianzhentan",
            model: 'HA-MQTT',
            sw_version: '1.2.1'
        }
    })
}