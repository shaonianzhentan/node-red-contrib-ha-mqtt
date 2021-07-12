const pinyin = require("node-pinyin")

module.exports = {
    object_id(name) {
        let arr = pinyin(name, { style: 'normal' })
        return arr.map(ele => ele[0]).join('_')
    },
    get_topic(type, name) {
        const object_id = this.object_id(name)
        const topic = `ha-mqtt/${type}/${object_id}/`
        return {
            // 配置
            config: `${topic}config`,
            // 状态
            state: `${topic}state`,
            // 属性
            attr: `${topic}attr`,
            // 控制
            command: `${topic}set`
        }
    }
}