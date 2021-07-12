const ha = require('./ha')

module.exports = function (RED) {
    const device_type = 'binary_sensor'
    RED.nodes.registerType(device_type, function (config) {
        const node = this
        // 配置
        const { server, name } = config
        // 连接MQTT
        const mqtt = RED.nodes.getNode(server);
        mqtt.connect()
        // 获取主题信息
        const topic = ha.get_topic(device_type, name)

        node.on('input', function (msg) {
            const { config, state, attributes } = msg
            // 更新配置
            if (config) {
                mqtt.client.publish(config_topic, Object.assign({
                    name,
                    state_topic: topic.state,
                    json_attr_t: topic.attr,
                    device_class: "motion"
                }, config))
                node.status({ fill: "green", shape: "ring", text: "更新配置" });
            }
            // 更新状态
            if (state) {
                mqtt.client.publish(topic.state, state)
                node.status({ fill: "green", shape: "ring", text: "更新状态：" + state });
            }
            // 更新属性
            if (attributes) {
                mqtt.client.publish(topic.attr, attributes)
                node.status({ fill: "green", shape: "ring", text: "更新属性" });
            }
        })
    });
}