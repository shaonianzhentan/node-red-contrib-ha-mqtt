const HomeAssistant = require('homeassistant');

module.exports = function (RED) {
    RED.nodes.registerType("ha-mqtt-homeassistant_config", class {
        constructor(cfg) {
            RED.nodes.createNode(this, cfg);
            const { hassUrl, token } = cfg
            const url = new URL(hassUrl);
            this.hass = new HomeAssistant({ host: `${url.protocol}//${url.hostname}`, port: url.port, token, ignoreCert: false });
        }
    })
}