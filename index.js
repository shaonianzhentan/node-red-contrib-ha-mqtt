const MqttSwitch = require('./nodes/switch/index')
const MqttLight = require('./nodes/light/index')
const MqttBinarySensor = require('./nodes/binary_sensor/index')

module.exports = function (RED) {

    const nodes = {
        'mqtt-light': MqttLight,
        'mqtt-switch': MqttSwitch,
        'mqtt-binary_sensor': MqttBinarySensor
    };

    for (const type in nodes) {
        console.log(type)
        RED.nodes.registerType(type, function (config) {
            nodes[type](RED, this, config)
        });
    }
}