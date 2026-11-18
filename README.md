# ha-mqtt
Generate MQTT entities in Home Assistant

[![platform](https://img.shields.io/badge/platform-Node--RED-red)](https://flows.nodered.org/node/node-red-contrib-ha-mqtt)
[![home-assistant](https://img.shields.io/badge/Home-Assistant-%23049cdb)](https://www.home-assistant.io/)
[![NPM version](https://img.shields.io/npm/v/node-red-contrib-ha-mqtt.svg?style=flat-square)](https://www.npmjs.com/package/node-red-contrib-ha-mqtt)

![visit](https://visitor-badge.laobi.icu/badge?page_id=shaonianzhentan.node-red-contrib-ha-mqtt&left_text=visit)
![forks](https://img.shields.io/github/forks/shaonianzhentan/node-red-contrib-ha-mqtt)
![stars](https://img.shields.io/github/stars/shaonianzhentan/node-red-contrib-ha-mqtt)
![license](https://img.shields.io/github/license/shaonianzhentan/node-red-contrib-ha-mqtt)

English | [简体中文](README.zh.md)

Reference document: https://www.home-assistant.io/integrations/mqtt#mqtt-discovery

Example：https://github.com/shaonianzhentan/node-red-contrib-ha-mqtt/wiki

## Supported languages
- ✔️ English (en-US)
- ✔️ Chinese (zh)
## Supported components
- ✔️  [alarm_control_panel](https://www.home-assistant.io/integrations/alarm_control_panel.mqtt/)
- ✔️  [binary_sensor](https://www.home-assistant.io/integrations/binary_sensor.mqtt/)
- ✔️  [button](https://www.home-assistant.io/integrations/button.mqtt/)
- ✔️  [camera](https://www.home-assistant.io/integrations/camera.mqtt/)
- ✔️  [climate](https://www.home-assistant.io/integrations/climate.mqtt/)
- ✔️  [cover](https://www.home-assistant.io/integrations/cover.mqtt/)
- ✔️  [date](https://www.home-assistant.io/integrations/date.mqtt/) (HA 2026.5+)
- ✔️  [datetime](https://www.home-assistant.io/integrations/datetime.mqtt/) (HA 2026.5+)
- ✔️  [device_tracker](https://www.home-assistant.io/integrations/device_tracker.mqtt/)
- ✔️  [device_automation](https://www.home-assistant.io/integrations/device_trigger.mqtt/)
- ✔️  [event](https://www.home-assistant.io/integrations/event.mqtt/)
- ✔️  [fan](https://www.home-assistant.io/integrations/fan.mqtt/)
- ✔️  [humidifier](https://www.home-assistant.io/integrations/humidifier.mqtt/)
- ✔️  [image](https://www.home-assistant.io/integrations/image.mqtt/)
- ✔️  [infrared](https://www.home-assistant.io/integrations/infrared.mqtt/) (HA 2026.7+)
- ✔️  [lawn_mower](https://www.home-assistant.io/integrations/lawn_mower.mqtt/)
- ✔️  [light](https://www.home-assistant.io/integrations/light.mqtt/)
- ✔️  [lock](https://www.home-assistant.io/integrations/lock.mqtt/)
- ✔️  [number](https://www.home-assistant.io/integrations/number.mqtt/)
- ✔️  [notify](https://www.home-assistant.io/integrations/notify.mqtt/)
- ✔️  [scene](https://www.home-assistant.io/integrations/scene.mqtt/)
- ✔️  [select](https://www.home-assistant.io/integrations/select.mqtt/)
- ✔️  [sensor](https://www.home-assistant.io/integrations/sensor.mqtt/)
- ✔️  [switch](https://www.home-assistant.io/integrations/switch.mqtt/)
- ✔️  [siren](https://www.home-assistant.io/integrations/siren.mqtt/)
- ✔️  [update](https://www.home-assistant.io/integrations/update.mqtt/)
- ✔️  [tag](https://www.home-assistant.io/integrations/tag.mqtt/)
- ✔️  [text](https://www.home-assistant.io/integrations/text.mqtt/)
- ✔️  [time](https://www.home-assistant.io/integrations/time.mqtt/) (HA 2026.5+)
- ✔️  [vacuum](https://www.home-assistant.io/integrations/vacuum.mqtt/)
- ✔️  [valve](https://www.home-assistant.io/integrations/valve.mqtt/)
- ✔️  [water_heater](https://www.home-assistant.io/integrations/water_heater.mqtt/)

Auto-discovery
```yaml
topic: homeassistant/status
payload: online
```

## Home Assistant compatibility
Discovery payloads follow the current HA MQTT discovery schema, including the `origin` block and per-entity availability (`online` / `offline`). `date`, `time` and `datetime` require HA 2026.5 or newer; `infrared` requires HA 2026.7 or newer. Availability can be disabled for a single entity by setting `"availability_topic": null` in its Configuration field.

### HA version selector
The device config node has a **Home Assistant version** dropdown. It defaults to **Latest**, which enables all platforms and uses current HA behavior (including remapping legacy binary sensor device classes). If you run an older HA, select the matching version:

- Discovery configs for platforms introduced in later HA versions are skipped; the affected node shows a yellow status instead of publishing a config HA cannot understand.
- Discovery attributes that only exist in newer HA versions are removed, including from hand-written JSON in the entity Configuration field.
- Legacy `binary_sensor` device class values (`cool`, `warm`, `carbon_monoxide`) are remapped to `cold`, `heat`, `gas` from HA 2022.9 onward; older versions keep the original value.

This is a manual setting. After upgrading HA, update the selection to enable newly supported platforms.

## If this project is helpful to you, please donate a cup of <del style="font-size: 14px;">coffee</del> milk tea 😘

<a href="https://paypal.me/shaonianzhentan"><img src="https://raw.githubusercontent.com/shaonianzhentan/image/main/picture/paypal.me.png" height="300" alt="https://paypal.me/shaonianzhentan" title="https://paypal.me/shaonianzhentan"></a>

## Reference Projects

- https://github.com/toobug/pinyin
- https://github.com/hujiulong/gcoord