# ha-mqtt
在HomeAssistant生成MQTT实体

参考文档：https://www.home-assistant.io/docs/mqtt/discovery/

## 支持组件
- [x] alarm_control_panel
- [x] binary_sensor
- [ ] camera
- [x] climate
- [ ] cover
- [x] device_tracker
- [ ] device_trigger - device_automation
- [x] fan
- [ ] humidifier
- [x] light
- [x] lock
- [x] number
- [x] scene - 场景
- [x] select - 选择器
- [x] sensor - 传感器
- [x] switch - 开关
- [ ] tag
- [ ] vacuum

- [x] keyboard - 键盘监听器
- [x] bluetooth_tracker - 蓝牙检测在家

## 配置

灯
```json
{
    "effect_list": [ "模式一", "模式二" ]
}
```

> 在HomeAssistant启动时自动配置设备
```yaml
service: mqtt.publish
data:
  topic: ha-mqtt/discovery
```


## 如果这个项目对你有帮助，请我喝杯<del style="font-size: 14px;">咖啡</del>奶茶吧😘
|支付宝|微信|
|---|---|
<img src="https://github.com/shaonianzhentan/ha-docs/raw/master/docs/img/alipay.png" align="left" height="160" width="160" alt="支付宝" title="支付宝">  |  <img src="https://github.com/shaonianzhentan/ha-docs/raw/master/docs/img/wechat.png" align="left" height="160" width="160" alt="微信支付" title="微信">