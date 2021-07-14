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

## 配置

灯
```json
{
    "effect_list": [ "模式一", "模式二" ]
}
```