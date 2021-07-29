const { exec } = require('child_process');
const ping = require('ping');

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-bluetooth_tracker', function (cfg) {
        RED.nodes.createNode(this, cfg);
        const node = this
        const { ip, mac } = cfg
        // 计数器
        const count = 0
        const ble_tracker = () => {
            exec(`hcitool name '${mac}'`, { timeout: 5000 }, (error, stdout, stderr) => {
                if (error) {
                    console.log('蓝牙检测出现错误：', error);
                    // 如果错误了，则重启蓝牙
                    exec('hciconfig hci0 up')
                    return;
                }
                // 检测到有人
                if (stdout) {
                    count = 0
                    node.send({ payload: 'home' })
                    node.status({ fill: "green", shape: "ring", text: '检测到蓝牙设备' });
                } else {
                    // 没有检测到设备时，计数器加一
                    count += 1
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
            });
        }
        // 15秒执行一次
        setTimeout(() => {
            // 如果4次没检测到设备，则宣布没人
            if (count >= 4) {
                node.send({ payload: 'not_home' })
            }
            if (ip) {
                // 检测IP
                ping.sys.probe(ip, function (isAlive) {
                    // 当前设备存在
                    if (isAlive) {
                        count = 0
                        node.send({ payload: 'home' })
                    } else {
                        // 如果IP不在线，则检测蓝牙
                        ble_tracker()
                    }
                    node.status({ fill: "green", shape: "ring", text: `检测到IP${isAlive ? '在线' : '离线'}` });
                }, { timeout: 2 });
            } else {
                ble_tracker()
            }
        }, 15000)
    })
}