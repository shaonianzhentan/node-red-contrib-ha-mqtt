const ha = require('../../utils')

module.exports = function (RED, node, config) {
    // 配置
    const { server, name } = config
    const mqtt = RED.nodes.getNode(server);
    const topic = ha.get_topic('switch', name)

    node.on('input', function (msg) {
        const { config, state, attributes } = msg
        // 更新配置
        if (config) {
            mqtt.publish(config_topic, Object.assign({
                name,
                state_topic: topic.state,
                json_attr_t: topic.attr,
                command_topic: topic.command,
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
    // 订阅主题
    mqtt.subscribe(topic.command, (msg) => {
        node.send(msg.toString())
    })
}