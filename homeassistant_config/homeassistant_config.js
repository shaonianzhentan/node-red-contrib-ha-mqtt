const HomeAssistant = require('homeassistant');

module.exports = function (RED) {
    RED.nodes.registerType("ha-mqtt-homeassistant_config", class {
        constructor(cfg) {
            RED.nodes.createNode(this, cfg);
            const { hassUrl, token } = cfg
            const url = new URL(hassUrl);
            // console.log(url)
            const host = `${url.protocol}//${url.hostname}`
            let port = url.port
            if (!port) {
                port = url.protocol == 'https' ? 443 : 80
            }
            this.hass = new HomeAssistant({ host, port, token, ignoreCert: false });
            this.hass.status().then((res) => {
                console.log(host, res)
            })
        }

        getServiceData(payload, entity_id) {
            if (typeof payload !== 'object') {
                payload = {}
            }
            if (!('entity_id' in payload)) {
                payload['entity_id'] = entity_id
            }
            return payload
        }

        async callService(service, data) {
            const arr = service.split('.')
            const res = await this.hass.services.call(arr[1], arr[0], data)
            return res
        }

        async fireEvent(event_type, event_data) {
            const res = await this.hass.events.fire(event_type, event_data)
            return res
        }
    })
}