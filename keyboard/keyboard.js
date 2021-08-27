const { spawn, execSync } = require('child_process');

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-keyboard', function (config) {
        RED.nodes.createNode(this, config);
        const node = this
        const inputDevice = config.name
        
        // 显示当前输入设备
        node.on('input', function (msg) {
            const payload = execSync('cat /proc/bus/input/devices').toString()
            node.send([null, { payload }])
        })

        function monitorKeyboard() {
            const ls = spawn('node', [__dirname + '/input.js', inputDevice]);

            ls.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
                data = JSON.parse(data)
                if ('code' in data) {
                    node.status({ fill: "green", shape: "ring", text: `键码：${data.code}` });
                    // console.log(data)
                    node.send([{
                        payload: {
                            dev: inputDevice,
                            ...data
                        }
                    }, null])
                } else {
                    node.status(data)
                }
            });

            ls.stderr.on('data', (data) => {
                node.status({ fill: "red", shape: "ring", text: `stderr: ${data}` });
            });

            ls.on('close', (code) => {
                node.status({ fill: "red", shape: "ring", text: `child process exited with code ${code}` });
                monitorKeyboard()
            });
        }

        monitorKeyboard()
    })
}