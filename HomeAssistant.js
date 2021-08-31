const fs = require('fs')
const pinyin = require("node-pinyin")

const pk = JSON.parse(fs.readFileSync(__dirname + '/package.json', 'utf-8'))

function object_id(name) {
    let arr = pinyin(name, { style: 'normal' })
    return arr.map(ele => ele[0]).join('_')
}

const DiscoveryDevice = {}

module.exports = class {
    constructor(node, cfg) {
        node.config = cfg.config
        this.node = node
        const { name } = cfg
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
            // 可用
            availability_topic: `${topic}availability/state`,
            // 效果
            effect_state_topic: `${topic}effect/state`,
            effect_command_topic: `${topic}effect/set`,
            // 亮度
            brightness_state_topic: `${topic}brightness/state`,
            brightness_command_topic: `${topic}brightness/set`,
            // 温度
            temperature_state_topic: `${topic}temperature/state`,
            temperature_command_topic: `${topic}temperature/set`,
            // 模式
            mode_state_topic: `${topic}mode/state`,
            mode_command_topic: `${topic}mode/set`,
            // 摆动
            oscillation_state_topic: `${topic}oscillation/state`,
            oscillation_command_topic: `${topic}oscillation/set`,
            // 百分比            
            percentage_state_topic: `${topic}percentage/state`,
            percentage_command_topic: `${topic}percentage/set`,
            // 预设模式            
            preset_mode_state_topic: `${topic}preset_mode/state`,
            preset_mode_command_topic: `${topic}preset_mode/set`,
        }
    }

    // 配置自动发现
    discovery(config) {
        DiscoveryDevice[this.config.unique_id] = () => {
            try {
                if (this.node.config) {
                    config = Object.assign(config, JSON.parse(this.node.config))
                }
                // console.log(config)
                this.publish_config(config)
            } catch (ex) {
                this.node.status({ fill: "red", shape: "ring", text: `自动配置失败：${ex}` });
            }
        }
        this.subscribe('homeassistant/status', (payload) => {
            if (payload === 'online') {
                for (const key in DiscoveryDevice) {
                    DiscoveryDevice[key]()
                }
            }
        })
    }

    // 配置
    publish_config(data) {
        const { name, unique_id, discovery_topic, state_topic, json_attr_t } = this.config
        // 合并配置
        const mergeConfig = Object.assign({
            name,
            unique_id,
            state_topic,
            json_attr_t,
            device: {
                name: '家庭助理',
                identifiers: ['635147515'],
                manufacturer: pk.author,
                model: 'HA-MQTT',
                sw_version: pk.version
            }
        }, data)
        // 删除为null的属性
        Object.keys(mergeConfig).forEach(key => {
            if (mergeConfig[key] === null) {
                delete mergeConfig[key]
            }
        })
        this.publish(discovery_topic, mergeConfig)
        this.node.status({ fill: "green", shape: "ring", text: `更新配置：${name}` });
    }

    // 状态
    publish_state(data) {
        this.publish(this.config.state_topic, String(data))
        this.node.status({ fill: "green", shape: "ring", text: `更新状态：${data}` });
    }

    // 属性
    publish_attributes(data) {
        this.publish(this.config.json_attr_t, data)
        this.node.status({ fill: "green", shape: "ring", text: `更新属性` });
    }

    // 效果
    publish_effect(data) {
        this.publish(this.config.effect_state_topic, data)
        this.node.status({ fill: "green", shape: "ring", text: `更新特效：${data}` });
    }

    // 摆动
    publish_oscillation(data) {
        this.publish(this.config.oscillation_state_topic, data)
        this.node.status({ fill: "green", shape: "ring", text: `更新摆动：${data}` });
    }

    // 百分比
    publish_percentage(data) {
        this.publish(this.config.percentage_state_topic, data)
        this.node.status({ fill: "green", shape: "ring", text: `更新百分比：${data}` });
    }

    // 预设模式
    publish_preset_mode(data) {
        this.publish(this.config.preset_mode_state_topic, data)
        this.node.status({ fill: "green", shape: "ring", text: `更新预设模式：${data}` });
    }

    // 亮度
    publish_brightness(data) {
        this.publish(this.config.brightness_state_topic, data)
        this.node.status({ fill: "green", shape: "ring", text: `更新亮度：${data}` });
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