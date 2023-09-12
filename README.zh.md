# ha-mqtt
在HomeAssistant生成MQTT实体

[![platform](https://img.shields.io/badge/platform-Node--RED-red)](https://flows.nodered.org/node/node-red-contrib-ha-mqtt)
[![home-assistant](https://img.shields.io/badge/Home-Assistant-%23049cdb)](https://www.home-assistant.io/)
[![NPM version](https://img.shields.io/npm/v/node-red-contrib-ha-mqtt.svg?style=flat-square)](https://www.npmjs.com/package/node-red-contrib-ha-mqtt)
![license](https://img.shields.io/github/license/shaonianzhentan/node-red-contrib-ha-mqtt)

![visit](https://visitor-badge.laobi.icu/badge?page_id=shaonianzhentan.node-red-contrib-ha-mqtt&left_text=visit)
![forks](https://img.shields.io/github/forks/shaonianzhentan/node-red-contrib-ha-mqtt)
![stars](https://img.shields.io/github/stars/shaonianzhentan/node-red-contrib-ha-mqtt)
![license](https://img.shields.io/github/license/shaonianzhentan/node-red-contrib-ha-mqtt)

[English](README.md) | 简体中文

参考文档：https://www.home-assistant.io/integrations/mqtt#mqtt-discovery

示例：https://github.com/shaonianzhentan/node-red-contrib-ha-mqtt/wiki

## 支持组件
- ✔️  [alarm_control_panel - 警报面板](https://www.home-assistant.io/integrations/alarm_control_panel.mqtt/)
- ✔️  [binary_sensor - 二元传感器](https://www.home-assistant.io/integrations/binary_sensor.mqtt/)
- ✔️  [button - 按钮](https://www.home-assistant.io/integrations/button.mqtt/)
- ✔️  [camera - 摄像头](https://www.home-assistant.io/integrations/camera.mqtt/)
- ✔️  [climate - 空调](https://www.home-assistant.io/integrations/climate.mqtt/)
- ✔️  [cover - 窗帘](https://www.home-assistant.io/integrations/cover.mqtt/)
- ✔️  [device_tracker - 设备检测](https://www.home-assistant.io/integrations/device_tracker.mqtt/)
- ✔️  [device_automation - 设备自动化](https://www.home-assistant.io/integrations/device_trigger.mqtt/)
- ✔️  [event - 事件](https://www.home-assistant.io/integrations/event.mqtt/)
- ✔️  [fan - 风扇](https://www.home-assistant.io/integrations/fan.mqtt/)
- ✔️  [humidifier - 加湿器](https://www.home-assistant.io/integrations/humidifier.mqtt/)
- ✔️  [image - 图像](https://www.home-assistant.io/integrations/image.mqtt/)
- ✔️  [lawn_mower - 割草机](https://www.home-assistant.io/integrations/lawn_mower.mqtt/)
- ✔️  [light - 灯](https://www.home-assistant.io/integrations/light.mqtt/)
- ✔️  [lock - 锁](https://www.home-assistant.io/integrations/lock.mqtt/)
- ✔️  [number - 数字](https://www.home-assistant.io/integrations/number.mqtt/)
- ✔️  [scene - 场景](https://www.home-assistant.io/integrations/scene.mqtt/)
- ✔️  [select - 选择器](https://www.home-assistant.io/integrations/select.mqtt/)
- ✔️  [sensor - 传感器](https://www.home-assistant.io/integrations/sensor.mqtt/)
- ✔️  [switch - 开关](https://www.home-assistant.io/integrations/switch.mqtt/)
- ✔️  [siren - 警报器](https://www.home-assistant.io/integrations/siren.mqtt/)
- ✔️  [update - 更新](https://www.home-assistant.io/integrations/update.mqtt/)
- ✔️  [tag - 标签](https://www.home-assistant.io/integrations/tag.mqtt/)
- ✔️  [text - 文本](https://www.home-assistant.io/integrations/text.mqtt/)
- ✔️  [vacuum - 扫地机器人](https://www.home-assistant.io/integrations/vacuum.mqtt/)
- ❌  [water_heater - 热水器](https://www.home-assistant.io/integrations/water_heater.mqtt/)


自动发现
```yaml
topic: homeassistant/status
payload: online
```

## 如果这个项目对你有帮助，请我喝杯<del style="font-size: 14px;">咖啡</del>奶茶吧😘
|  |支付宝|微信|
|---|---|---|
奶茶= | <img src="https://cdn.jsdelivr.net/gh/shaonianzhentan/ha-docs@master/docs/img/alipay.png" align="left" height="160" width="160" alt="支付宝" title="支付宝">  |  <img src="https://cdn.jsdelivr.net/gh/shaonianzhentan/ha-docs@master/docs/img/wechat.png" height="160" width="160" alt="微信支付" title="微信">

## 关注我的微信订阅号，了解更多HomeAssistant相关知识
<img src="https://cdn.jsdelivr.net/gh/shaonianzhentan/ha-docs@master/docs/img/wechat-channel.png" height="160" alt="HomeAssistant家庭助理" title="HomeAssistant家庭助理"> 

## 引用项目

- https://github.com/toobug/pinyin
- https://github.com/hujiulong/gcoord