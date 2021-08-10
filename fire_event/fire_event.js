
module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-fire_event', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            const node = this
            node.on('input', function (msg) {
                let { event_type, payload } = msg
                try {
                    if (!event_type) event_type = cfg.event_type
                    node.status({ fill: "blue", shape: "ring", text: `触发中：${event_type}` });
                    this.server.fireEvent(event_type, payload).then(res => {
                        node.send({
                            payload: res
                        })
                        node.status({ fill: "green", shape: "ring", text: `触发成功：${event_type}` });
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