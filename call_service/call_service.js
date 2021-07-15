const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-call_service', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            const node = this
            node.on('input', function (msg) {
                let { service, payload } = msg
                try {
                    if (!service) service = cfg.service
                    node.status({ fill: "blue", shape: "ring", text: `调用中：${service}` });
                    this.server.callService(service, this.server.getServiceData(payload, cfg.entity_id)).then(res => {
                        node.send({
                            payload: res
                        })
                        node.status({ fill: "green", shape: "ring", text: `调用成功：${service}` });
                    }).catch(err => {
                        node.status({ fill: "red", shape: "ring", text: err });
                    });
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: ex });
                }
            })
        } else {
            this.status({ fill: "red", shape: "ring", text: "未配置HomeAssistant信息" });
        }
    })
}