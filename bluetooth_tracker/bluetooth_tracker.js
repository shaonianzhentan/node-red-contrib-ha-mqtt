const { spawn } = require('child_process');

function log() {
    console.log(`【${new Date().toLocaleString()}】`, ...arguments)
}

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-bluetooth_tracker', function (cfg) {
        RED.nodes.createNode(this, cfg);
        const node = this
        const ls = spawn('node', [__dirname + '/tracker.js', JSON.stringify(cfg)]);

        ls.stdout.on('data', (data) => {
            log(data.toString());
            try {
                data = JSON.parse(data)
                if ('payload' in data) {
                    node.send({ payload: data.payload })
                } else if ('error' in data) {
                    node.status({ fill: "red", shape: "ring", text: JSON.stringify(data.error) });
                } else if ('isAlive' in data) {
                    node.status({ fill: "green", shape: "ring", text: `检测到IP${data.isAlive ? '在线' : '离线'}` });
                }
            } catch {
            }
        });

        ls.stderr.on('data', (data) => {
            node.status({ fill: "red", shape: "ring", text: `stderr: ${data}` });
        });

        ls.on('close', (code) => {
            node.status({ fill: "red", shape: "ring", text: `child process exited with code ${code}` });
        });
    })
}