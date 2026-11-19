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
- ✔️  [date - 日期](https://www.home-assistant.io/integrations/date.mqtt/)（HA 2026.5+）
- ✔️  [datetime - 日期时间](https://www.home-assistant.io/integrations/datetime.mqtt/)（HA 2026.5+）
- ✔️  [device_tracker - 设备检测](https://www.home-assistant.io/integrations/device_tracker.mqtt/)
- ✔️  [device_automation - 设备自动化](https://www.home-assistant.io/integrations/device_trigger.mqtt/)
- ✔️  [event - 事件](https://www.home-assistant.io/integrations/event.mqtt/)
- ✔️  [fan - 风扇](https://www.home-assistant.io/integrations/fan.mqtt/)
- ✔️  [humidifier - 加湿器](https://www.home-assistant.io/integrations/humidifier.mqtt/)
- ✔️  [image - 图像](https://www.home-assistant.io/integrations/image.mqtt/)
- ✔️  [infrared - 红外](https://www.home-assistant.io/integrations/infrared.mqtt/)（HA 2026.7+）
- ✔️  [lawn_mower - 割草机](https://www.home-assistant.io/integrations/lawn_mower.mqtt/)
- ✔️  [light - 灯](https://www.home-assistant.io/integrations/light.mqtt/)
- ✔️  [lock - 锁](https://www.home-assistant.io/integrations/lock.mqtt/)
- ✔️  [number - 数字](https://www.home-assistant.io/integrations/number.mqtt/)
- ✔️  [notify - 通知](https://www.home-assistant.io/integrations/notify.mqtt/)
- ✔️  [scene - 场景](https://www.home-assistant.io/integrations/scene.mqtt/)
- ✔️  [select - 选择器](https://www.home-assistant.io/integrations/select.mqtt/)
- ✔️  [sensor - 传感器](https://www.home-assistant.io/integrations/sensor.mqtt/)
- ✔️  [switch - 开关](https://www.home-assistant.io/integrations/switch.mqtt/)
- ✔️  [siren - 警报器](https://www.home-assistant.io/integrations/siren.mqtt/)
- ✔️  [update - 更新](https://www.home-assistant.io/integrations/update.mqtt/)
- ✔️  [tag - 标签](https://www.home-assistant.io/integrations/tag.mqtt/)
- ✔️  [text - 文本](https://www.home-assistant.io/integrations/text.mqtt/)
- ✔️  [time - 时间](https://www.home-assistant.io/integrations/time.mqtt/)（HA 2026.5+）
- ✔️  [vacuum - 扫地机器人](https://www.home-assistant.io/integrations/vacuum.mqtt/)
- ✔️  [valve - 阀门](https://www.home-assistant.io/integrations/valve.mqtt/)
- ✔️  [water_heater - 热水器](https://www.home-assistant.io/integrations/water_heater.mqtt/)


自动发现
```yaml
topic: homeassistant/status
payload: online
```

## Home Assistant 兼容性
发现报文已按当前 HA MQTT discovery 规范生成，包含 `origin` 信息以及每个实体的可用性（`online` / `offline`）。`date`、`time`、`datetime` 需要 HA 2026.5 及以上版本，`infrared` 需要 HA 2026.7 及以上版本。如需为单个实体关闭可用性，可在其「配置」字段中设置 `"availability_topic": null`。

### HA 版本选择
设备配置节点中新增了 **Home Assistant 版本** 下拉框，默认「最新」，启用全部平台并使用当前 HA 的行为（包括映射旧版 binary sensor 设备类型）。如果使用较旧的 HA，请选择对应版本：

- 该版本尚未引入的平台会跳过发现报文发布，对应节点显示黄色状态，不再向 HA 发送它无法识别的配置。
- 仅新版本才支持的发现属性会被移除，包括实体「配置」字段中手写的 JSON 字段。
- 从 HA 2022.9 起，`binary_sensor` 的旧设备类型值（`cool`、`warm`、`carbon_monoxide`）会映射为 `cold`、`heat`、`gas`；选择更早版本时保留原值。

这是手动设置。升级 HA 后请同步修改该选项，以启用新平台。

## 如果这个项目对你有帮助，请我喝杯<del style="font-size: 14px;">咖啡</del>奶茶吧😘
|  |支付宝|微信|
|---|---|---|
奶茶= | <img src="https://cdn.jsdelivr.net/gh/shaonianzhentan/ha-docs@master/docs/img/alipay.png" align="left" height="160" width="160" alt="支付宝" title="支付宝">  |  <img src="https://cdn.jsdelivr.net/gh/shaonianzhentan/ha-docs@master/docs/img/wechat.png" height="160" width="160" alt="微信支付" title="微信">

## 关注我的微信订阅号，了解更多HomeAssistant相关知识
<img src="https://cdn.jsdelivr.net/gh/shaonianzhentan/ha-docs@master/docs/img/wechat-channel.png" height="160" alt="HomeAssistant家庭助理" title="HomeAssistant家庭助理"> 

## 引用项目

- https://github.com/toobug/pinyin
- https://github.com/hujiulong/gcoord