# ha-mqtt
在HomeAssistant生成MQTT实体

参考文档：https://www.home-assistant.io/docs/mqtt/discovery/

## 支持组件
- [x] alarm_control_panel
- [x] binary_sensor
- [ ] camera
- [ ] climate
- [ ] cover
- [ ] device_tracker
- [ ] device_trigger
- [ ] fan
- [x] light
- [x] lock
- [ ] number
- [ ] scene
- [ ] select
- [x] sensor
- [x] switch
- [ ] tag
- [ ] vacuum

- [x] keyboard - 键盘监听器

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


## 如果这个项目对你有帮助，请我喝杯<del><small>咖啡</small></del><b>奶茶</b>吧😘
|支付宝|微信|
|---|---|
<img src="https://ha.jiluxinqing.com/img/alipay.png" align="left" height="160" width="160" alt="支付宝" title="支付宝">  |  <img src="https://ha.jiluxinqing.com/img/wechat.png" align="left" height="160" width="160" alt="微信支付" title="微信">