const { exec } = require('child_process');
const ping = require('ping');

const { ip, mac } = JSON.parse(process.argv[2])

function log(data) {
    console.log(JSON.stringify(data))
}
// 在家检测时间
const homeTime = 15000
// 离家检测时间
const not_homeTime = 10000
// 计数器
let count = 0
// 蓝牙检测
const ble_tracker = () => {
    // 如果4次没检测到设备，则宣布没人
    if (count >= 4) {
        log({ payload: 'not_home' })
    }
    return new Promise((resolve, reject) => {
        exec(`hcitool name '${mac}'`, { timeout: 5000 }, (error, stdout, stderr) => {
            if (error) {
                log({ error });
                // 如果错误了，则重启蓝牙
                exec('hciconfig hci0 up')
                reject()
                return;
            }
            // 检测到有人
            if (stdout) {
                log({ payload: 'home', bluetooth: stdout })
                resolve()
            } else {
                // 没有检测到设备时，计数器加一
                reject()
            }
        });
    })
}
// IP检测
const ip_tracker = () => {
    ping.sys.probe(ip, function (isAlive) {
        if (isAlive == null) return;
        log({ isAlive })
        // 当前设备存在
        if (isAlive) {
            count = 0
            setTimeout(() => {
                ip_tracker()
            }, homeTime)
            log({ payload: 'home' })
        } else {
            // 如果IP不在线，则检测蓝牙
            ble_tracker().then(() => {
                count = 0
                setTimeout(() => {
                    ip_tracker()
                }, homeTime)
            }).catch(() => {
                count += 1
                // 如果蓝牙检测出错，则10秒检测一次
                setTimeout(() => {
                    ip_tracker()
                }, not_homeTime)
            })
        }
    }, { timeout: 10 });
}

ip_tracker()