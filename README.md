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