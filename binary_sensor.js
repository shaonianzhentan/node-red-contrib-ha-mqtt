const ha = require('./ha')
const MqttClient = require('./MqttClient')
const device_type = 'binary_sensor'

module.exports = function (RED) {
    RED.nodes.registerType(device_type, function (config) {
        const node = this
        // 配置
        const { server, name } = config
        // 连接MQTT
        const mqtt = MqttClient()
        // 获取主题信息
        const topic = ha.get_topic(device_type, name)
        node.on('input', function (msg) {
            const { config, state, attributes } = msg
            try {
                // 更新配置
                if (config && typeof config === 'object') {
                    mqtt.publish(topic.config, Object.assign({
                        name,
                        unique_id: topic.unique_id,
                        state_topic: topic.state,
                        device: ha.device,
                        json_attr_t: topic.attr,
                        device_class: "motion"
                    }, config))
                }
                // 更新状态
                if (state) {
                    mqtt.publish(topic.state, state)
                }
                // 更新属性
                if (attributes) {
                    mqtt.publish(topic.attr, attributes)
                }
            } catch (ex) {

            }
        })
    });
}