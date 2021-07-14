const fs = require('fs')
const _ = require('lodash');
const InputEvent = require('input-event');

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-keyboard', function (config) {
        RED.nodes.createNode(this, config);
        const node = this
        const inputDevice = config.name
        if (!fs.existsSync(inputDevice)) {
            return this.status({ fill: "red", shape: "ring", text: `未找到设备：${inputDevice}` });
        }
        // console.log(inputDevice)
        const input = new InputEvent(inputDevice);
        const keyboard = new InputEvent.Keyboard(input);
        //keyboard.on('keyup'   , console.log);
        //keyboard.on('keydown' , console.log);
        keyboard.on('keypress', _.throttle(function (data) {
            node.status({ fill: "green", shape: "ring", text: `键码：${data.code}` });
            // console.log(data)
            node.send([{
                payload: {
                    dev: inputDevice,
                    ...data
                }
            }])
        }), 500);
    })
}