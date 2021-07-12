const ha = require('../../utils')

module.exports = function (RED, node, config) {
    // 配置
    const { server, name } = config
    const mqtt = RED.nodes.getNode(server);
    const topic = ha.get_topic('binary_sensor', name)

    node.on('input', function (msg) {
        const { config, state, attributes } = msg
        // 更新配置
        if (config) {
            mqtt.publish(config_topic, Object.assign({
                name,
                state_topic: topic.state,
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
    })
}