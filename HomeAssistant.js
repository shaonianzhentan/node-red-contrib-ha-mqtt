const pinyin = require("node-pinyin")

function object_id(name) {
    let arr = pinyin(name, { style: 'normal' })
    return arr.map(ele => ele[0]).join('_')
}

module.exports = class {
    constructor(node, config) {
        this.node = node
        const { name } = config
        const entity_id = object_id(name)
        const type = node.type.replace('ha-mqtt-', '')
        const topic = `ha-mqtt/${type}/${entity_id}/`
        this.config = {
            name,
            unique_id: topic.replace(/\//g, '_'),
            discovery_topic: `homeassistant/${type}/${entity_id}/config`,
            state_topic: `${topic}state`,
            json_attr_t: `${topic}attr`,
            command_topic: `${topic}set`,
        }
    }

    // 配置
    publish_config(data) {
        const { name, unique_id, discovery_topic, state_topic, json_attr_t } = this.config
        this.publish(discovery_topic, Object.assign({
            name,
            unique_id,
            state_topic,
            json_attr_t,
            device: {
                name: '家庭助理',
                identifiers: ['635147515'],
                manufacturer: 'shaonianzhentan',
                model: 'HA-MQTT',
                sw_version: '0.1'
            }
        }, data))
    }

    // 状态
    publish_state(data) {
        this.publish(this.config.state_topic, data)
    }

    // 属性
    publish_attributes(data) {
        this.publish(this.config.json_attr_t, data)
    }

    // 订阅
    subscribe(topic, callback) {
        this.node.server.subscribe(topic, { qos: 0 }, function (mtopic, mpayload, mpacket) {
            callback(mpayload.toString())
        })
    }

    // 发布
    publish(topic, payload) {
        if (typeof payload === 'object') {
            payload = JSON.stringify(payload)
        }
        this.node.server.client.publish(topic, payload)
    }
}