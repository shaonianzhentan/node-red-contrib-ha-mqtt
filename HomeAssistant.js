const fs = require('fs')
const { isNumber } = require('lodash')
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
            power_command_topic: `${topic}power/set`,
            // 效果
            effect_state_topic: `${topic}effect/state`,
            effect_command_topic: `${topic}effect/set`,
            // 亮度
            brightness_state_topic: `${topic}brightness/state`,
            brightness_command_topic: `${topic}brightness/set`,
            // 当前温度
            current_temperature_topic: `${topic}current_temperature`,
            // 温度
            temperature_state_topic: `${topic}temperature/state`,
            temperature_command_topic: `${topic}temperature/set`,
            // 模式
            mode_state_topic: `${topic}mode/state`,
            mode_command_topic: `${topic}mode/set`,
            // 风扇模式
            fan_mode_state_topic: `${topic}fan_mode/state`,
            fan_mode_command_topic: `${topic}fan_mode/set`,
            // 摆动模式
            swing_mode_state_topic: `${topic}swing_mode/state`,
            swing_mode_command_topic: `${topic}swing_mode/set`,
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
        this.publish(this.config.state_topic, data)
        this.node.status({ fill: "green", shape: "ring", text: `更新状态：${data}` });
    }

    // 属性
    publish_attributes(data) {
        this.publish(this.config.json_attr_t, data)
        this.node.status({ fill: "green", shape: "ring", text: `更新属性` });
    }

    // 当前温度
    publish_current_temperature(data) {
        this.publish(this.config.current_temperature_topic, data)
        this.node.status({ fill: "green", shape: "ring", text: `更新当前温度：${data}` });
    }

    // 当前温度
    publish_temperature(data) {
        this.publish(this.config.temperature_state_topic, data)
        this.node.status({ fill: "green", shape: "ring", text: `更新温度：${data}` });
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
    publish_mode(data) {
        this.publish(this.config.mode_state_topic, data)
        this.node.status({ fill: "green", shape: "ring", text: `更新模式：${data}` });
    }

    // 预设模式
    publish_preset_mode(data) {
        this.publish(this.config.preset_mode_state_topic, data)
        this.node.status({ fill: "green", shape: "ring", text: `更新预设模式：${data}` });
    }

    // 摆动模式
    publish_swing_mode(data) {
        this.publish(this.config.swing_mode_state_topic, data)
        this.node.status({ fill: "green", shape: "ring", text: `更新预设模式：${data}` });
    }

    // 风速模式
    publish_fan_mode(data) {
        this.publish(this.config.fan_mode_state_topic, data)
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

    // 获取内容
    send_payload(payload, i, len = 4) {
        let arr = []
        arr.length = len
        arr[i - 1] = { payload }
        this.node.send(arr)
    }

    // 发布
    publish(topic, payload) {
        if (typeof payload === 'object') {
            payload = JSON.stringify(payload)
        }
        if (isNumber(payload)) {
            payload = String(payload)
        }
        this.node.server.client.publish(topic, payload)
    }
}