const pinyin = require("node-pinyin")

module.exports = {
    id: 'home-assistant',
    object_id(name) {
        let arr = pinyin(name, { style: 'normal' })
        return arr.map(ele => ele[0]).join('_')
    },
    // 获取MQTT设备信息
    get device() {
        return {
            name: 'HA-MQTT',
            identifiers: ['635147515'],
            manufacturer: 'shaonianzhentan',
            model: 'HomeAssistant',
            sw_version: '0.1'
        }
    },
    get_topic(type, name) {
        const object_id = 'ha_mqtt_' + this.object_id(name)
        const topic = `ha-mqtt/${type}/${object_id}/`
        return {
            unique_id: type + '_' + object_id,
            // 配置
            config: `homeassistant/${type}/${object_id}/config`,
            // 状态
            state: `${topic}state`,
            // 属性
            attr: `${topic}attr`,
            // 控制
            command: `${topic}set`
        }
    }
}