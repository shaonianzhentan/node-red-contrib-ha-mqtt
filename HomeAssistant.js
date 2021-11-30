const fs = require('fs')
const pinyin = require("node-pinyin")

const pk = JSON.parse(fs.readFileSync(__dirname + '/package.json', 'utf-8'))

const DiscoveryDevice = {}

module.exports = class {
    constructor(node, cfg) {
        node.config = cfg.config
        this.node = node
        const { name } = cfg
        const entity_id = name
        const type = node.type.replace('ha-mqtt-', '')
        const topic = `ha-mqtt/${type}/${entity_id}/`
        const device = Object.assign({
            name: 'Home Assistant',
            identifiers: ['ha-mqtt-default-device'],
            model: 'HA-MQTT',
            sw_version: pk.version
        }, cfg.device)
        this.config = {
            name,
            device,
            unique_id: topic.replace(/\//g, '_'),
            discovery_topic: `homeassistant/${type}/${entity_id}/config`,
            state_topic: `${topic}state`,
            json_attr_t: `${topic}attr`,
            command_topic: `${topic}set`,
            // 位置
            position_topic: `${topic}position/state`,
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
            // 目标湿度
            target_humidity_state_topic: `${topic}target_humidity/state`,
            target_humidity_command_topic: `${topic}target_humidity/set`,
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
            // 倾斜
            tilt_state_topic: `${topic}tilt/state`,
            tilt_command_topic: `${topic}tilt/set`,
            // 电量
            battery_level_topic: `${topic}battery_level/state`,
            // 充电中
            charging_topic: `${topic}charging/state`,
            // 清洁中
            cleaning_topic: `${topic}cleaning/state`,
            // 停靠
            docked_topic: `${topic}docked/state`,
            // 错误
            error_topic: `${topic}error/state`,
            // 风速
            fan_speed_topic: `${topic}fan_speed/state`,
            set_fan_speed_topic: `${topic}set_fan_speed/set`,
            send_command_topic: `${topic}send_command/set`,
        }
    }

    // Automatic discovery
    discovery(config) {
        DiscoveryDevice[this.config.unique_id] = () => {
            try {
                if (this.node.config) {
                    config = Object.assign(config, JSON.parse(this.node.config))
                }
                // console.log(config)
                this.publish_config(config)
            } catch (ex) {
                this.node.status({ fill: "red", shape: "ring", text: `Auto configuration failed: ${ex}` });
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

    // Configure
    publish_config(data) {
        const { name, device, unique_id, discovery_topic, state_topic, json_attr_t } = this.config
        // Consolidation configuration
        const mergeConfig = Object.assign({
            name,
            unique_id,
            state_topic,
            json_attr_t,
            device
        }, data)
        // Delete the property of NULL
        Object.keys(mergeConfig).forEach(key => {
            if (mergeConfig[key] === null) {
                delete mergeConfig[key]
            }
        })
        this.publish(discovery_topic, mergeConfig)
        this.node.status({ fill: "green", shape: "ring", text: `Update configuration：${name}` });
    }

    // 状态
    publish_state(data) {
        this.publish(this.config.state_topic, data, "Update state")
    }

    // 属性
    publish_attributes(data) {
        this.publish(this.config.json_attr_t, data, "Update attribute")
    }

    // 当前温度
    publish_current_temperature(data) {
        this.publish(this.config.current_temperature_topic, data, "Update the current temperature")
    }

    // 当前温度
    publish_temperature(data) {
        this.publish(this.config.temperature_state_topic, data, "Update temperature")
    }

    // 目标湿度
    publish_target_humidity(data) {
        this.publish(this.config.target_humidity_state_topic, data, "Update the target humidity")
    }

    // 效果
    publish_effect(data) {
        this.publish(this.config.effect_state_topic, data, "Update effects")
    }

    // 摆动
    publish_oscillation(data) {
        this.publish(this.config.oscillation_state_topic, data, "Update oscillation")
    }

    // 百分比
    publish_percentage(data) {
        this.publish(this.config.percentage_state_topic, data, "Update percentage")
    }

    // 预设模式
    publish_mode(data) {
        this.publish(this.config.mode_state_topic, data, "Update mode")
    }

    // 预设模式
    publish_preset_mode(data) {
        this.publish(this.config.preset_mode_state_topic, data, "Update preset mode")
    }

    // 摆动模式
    publish_swing_mode(data) {
        this.publish(this.config.swing_mode_state_topic, data, "Update swing mode")
    }

    // 风速模式
    publish_fan_mode(data) {
        this.publish(this.config.fan_mode_state_topic, data, "Update fan mode")
    }

    // 亮度
    publish_brightness(data) {
        this.publish(this.config.brightness_state_topic, data, "Update brightness")
    }

    // 电量
    publish_battery_level(data) {
        this.publish(this.config.battery_level_topic, data, "Update battery level")
    }

    publish_charging(data) {
        this.publish(this.config.charging_topic, data, "Update charging status")
    }

    publish_cleaning(data) {
        this.publish(this.config.cleaning_topic, data, "Update cleaning status")
    }

    publish_docked(data) {
        this.publish(this.config.docked_topic, data, "Update docking status")
    }

    publish_error(data) {
        this.publish(this.config.error_topic, data, "Update error status")
    }

    publish_fan_speed(data) {
        this.publish(this.config.fan_speed_topic, data, "Update fan speed")
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
    publish(topic, payload, msg = "") {
        const type = Object.prototype.toString.call(payload)
        switch (type) {
            case '[object Uint8Array]':
                this.node.server.client.publish(topic, payload, { retain: false })
                return;
            case '[object Object]':
                payload = JSON.stringify(payload)
                break;
            case '[object Number]':
                payload = String(payload)
                break;
        }
        this.node.server.client.publish(topic, payload)
        if (msg) {
            this.node.status({ fill: "green", shape: "ring", text: `${msg}：${payload}` });
        }
    }
}