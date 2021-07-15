const HomeAssistant = require('homeassistant');

module.exports = function (RED) {
    RED.nodes.registerType("ha-mqtt-homeassistant_config", class {
        constructor(cfg) {
            RED.nodes.createNode(this, cfg);
            const { host, port, token } = cfg
            this.hass = new HomeAssistant({ host, port, token, ignoreCert: false });
        }
    })
}