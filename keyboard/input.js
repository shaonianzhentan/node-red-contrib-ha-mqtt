const fs = require('fs')
const _ = require('lodash');
const InputEvent = require('input-event');

const inputDevice = process.argv[2]
if (!fs.existsSync(inputDevice)) {
    console.log(JSON.stringify({ fill: "red", shape: "ring", text: `未找到设备：${inputDevice}` }));
} else {
    const input = new InputEvent(inputDevice);
    const keyboard = new InputEvent.Keyboard(input);
    keyboard.on('keypress', _.throttle(function (data) {
        console.log(JSON.stringify(data))
    }), 500);
}