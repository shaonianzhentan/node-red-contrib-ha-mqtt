const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-call_service', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            const node = this
            node.on('input', function (msg) {
                const { service, entity_id, payload } = msg
                try {
                    const arr = service.split('.')
                    node.status({ fill: "blue", shape: "ring", text: `调用中：${service}` });
                    const res = this.server.hass.services.call(arr[1], arr[0], { entity_id, ...payload })
                    node.send({
                        payload: res
                    })
                    node.status({ fill: "green", shape: "ring", text: `调用成功：${service}` });
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: ex });
                }
            })
        } else {
            this.status({ fill: "red", shape: "ring", text: "未配置HomeAssistant信息" });
        }
    })
}