const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-vacuum', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            this.server.register(this)
            const ha = new HomeAssistant(this, cfg)
            const node = this
            node.on('input', function (msg) {
                const { payload, attributes, battery_level, charging, cleaning, docked, error, fan_speed } = msg
                try {
                    // 更新状态
                    if (payload) {
                        ha.publish_state(payload)
                    }
                    // 更新属性
                    if (attributes) {
                        ha.publish_attributes(attributes)
                    }
                    if (battery_level) {
                        ha.publish_battery_level(battery_level)
                    }
                    if (charging) {
                        ha.publish_charging(charging)
                    }
                    if (cleaning) {
                        ha.publish_cleaning(cleaning)
                    }
                    if (docked) {
                        ha.publish_docked(docked)
                    }
                    if (error) {
                        ha.publish_error(error)
                    }
                    if (fan_speed) {
                        ha.publish_fan_speed(fan_speed)
                    }
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: ex });
                }
            })
            const { command_topic, send_command_topic,
                battery_level_topic,
                charging_topic,
                cleaning_topic,
                docked_topic,
                error_topic,
                fan_speed_topic,
                set_fan_speed_topic, } = ha.config
            // 订阅主题
            ha.subscribe(command_topic, (payload) => {
                ha.send_payload(payload, 1, 3)
                ha.publish_state(payload)
            })
            ha.subscribe(set_fan_speed_topic, (payload) => {
                ha.send_payload(payload, 2, 3)
                ha.publish_fan_speed(payload)
            })
            ha.subscribe(send_command_topic, (payload) => {
                ha.send_payload(payload, 3, 3)
            })
            ha.discovery({
                command_topic,
                send_command_topic,
                battery_level_topic,
                charging_topic,
                cleaning_topic,
                docked_topic,
                error_topic,
                fan_speed_topic,
                set_fan_speed_topic,
                fan_speed_list: ["min", "medium", "high", "max"],
                supported_features: [
                    "turn_on", "turn_off", "pause", "stop", "return_home",
                    "battery", "status", "locate", "clean_spot", "fan_speed", "send_command"
                ],
            })
        } else {
            this.status({ fill: "red", shape: "ring", text: "MQTT Unconfigured" });
        }
    })
}