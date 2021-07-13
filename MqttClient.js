const mqtt = require('mqtt')

class MqttClient {
    constructor() {
        this.host = 'localhost'
        this.port = 1883
        this.connected = false
        this.events = {}
        const client = mqtt.connect(`mqtt://${this.host}`)
        client.on('connect', () => {
            this.connected = true
            console.log('开始监听当前连接状态')
        })

        client.on('message', (topic, message) => {
            console.log(topic, message.toString())
            // message is Buffer
            if (topic in this.events) {
                this.events[topic].forEach((callback) => {
                    callback(message.toString())
                })
            }
        })

        client.on('disconnect', () => {
            console.log('断开连接')
        })

        client.on('reconnect', () => {
            console.log('重新连接')
        })

        client.on('error', (err) => {
            console.log('出现错误', err)
        })

        this.client = client
    }

    // 订阅
    subscribe(topic, callback) {
        this.client.subscribe(topic, (err) => {
            if (err) {
                console.log(topic, err)
            }
        })
        if (!(topic in this.events)) {
            this.events[topic] = []
        }
        this.events[topic].push(callback)
    }

    // 发布
    publish(topic, payload) {
        if (typeof payload === 'object') {
            payload = JSON.stringify(payload)
        }
        this.client.publish(topic, payload)
    }
}


let mqttClient = null

module.exports = function () {
    if (mqttClient == null) {
        mqttClient = new MqttClient()
    }
    return mqttClient
}