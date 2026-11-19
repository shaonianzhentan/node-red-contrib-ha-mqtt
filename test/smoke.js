const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const pkg = require(path.join(root, 'package.json'))
const HomeAssistant = require(path.join(root, 'HomeAssistant'))

const published = []
const subscriptions = []
const subscribers = {}
const instances = {}

const server = {
  register() { },
  subscribe(topic, options, callback) {
    subscriptions.push(topic)
    subscribers[topic] = callback
  },
  client: {
    publish(topic, payload, options) { published.push({ topic, payload, options }) }
  }
}
const device = {
  device_info: { identifiers: 'test-device', name: 'Test Device' },
  retain: true,
  haVersion: 'latest'
}

const registry = {}
const RED = {
  _: key => key,
  nodes: {
    registerType(type, constructor) { registry[type] = constructor },
    createNode(node, cfg) {
      node.id = cfg.id
      node.type = cfg.type
      node.on = (event, handler) => {
        if (event === 'close') node._close = handler
        if (event === 'input') node._input = handler
      }
      node.send = () => { }
      node.status = (status) => { node._status = status }
      instances[node.id] = node
    },
    getNode(id) {
      if (instances[id]) return instances[id]
      if (id === 'srv') return server
      if (id === 'dev') return device
      return null
    }
  }
}

function loadNode(type, config = '', id = 'node-' + type) {
  const cfg = { id, type, server: 'srv', device: 'dev', name: type, config }
  registry[type].call({}, cfg)
  return instances[id]
}

function configMessages() {
  return published.filter(item => item.topic.endsWith('/config'))
}

function lastConfig() {
  const messages = configMessages()
  return JSON.parse(messages[messages.length - 1].payload)
}

// Every registered node must have a runtime and an editor file.
for (const [name, file] of Object.entries(pkg['node-red'].nodes)) {
  require(path.join(root, file))(RED)
  assert.ok(registry['ha-mqtt-' + name], `missing runtime registration: ${name}`)
  assert.ok(fs.existsSync(path.join(root, file.replace(/\.js$/, '.html'))), `missing editor file: ${name}`)
}

// Discovery payload follows the current HA schema.
loadNode('ha-mqtt-switch')
const discovery = lastConfig()
assert.strictEqual(discovery.origin.name, 'node-red-contrib-ha-mqtt')
assert.strictEqual(discovery.origin.sw_version, pkg.version)
assert.ok(discovery.origin.support_url.startsWith('https://'))
assert.strictEqual(discovery.device.identifiers, 'test-device')
assert.ok(discovery.unique_id)
assert.ok(discovery.state_topic)
assert.ok(discovery.command_topic)
assert.strictEqual(discovery.json_attr_t, discovery.state_topic.replace(/state$/, 'attr'))
assert.ok(discovery.availability_topic.endsWith('/availability/state'))
assert.strictEqual(discovery.payload_available, 'online')
assert.strictEqual(discovery.payload_not_available, 'offline')
assert.ok(!Object.values(discovery).includes(null), 'null discovery keys must be removed')
assert.ok(published.some(item => item.topic === discovery.availability_topic && item.payload === 'online'))

// Re-publishing on HA birth must not accumulate or mutate config.
const before = JSON.stringify(lastConfig())
HomeAssistant.AutoDiscovery(RED.nodes)
assert.strictEqual(JSON.stringify(lastConfig()), before)

// Availability can be disabled per entity.
published.length = 0
loadNode('ha-mqtt-date', JSON.stringify({ availability_topic: null }), 'node-no-availability')
const withoutAvailability = lastConfig()
assert.ok(!Object.prototype.hasOwnProperty.call(withoutAvailability, 'availability_topic'))
assert.ok(!published.some(item => item.payload === 'online' || item.payload === 'offline'))

// The three HA 2026.5+ platforms register and publish valid discovery configs.
for (const type of ['ha-mqtt-date', 'ha-mqtt-time', 'ha-mqtt-datetime']) {
  loadNode(type, '', 'node-' + type)
  const config = lastConfig()
  assert.ok(config.command_topic, `${type} must advertise command_topic`)
  assert.ok(config.state_topic, `${type} must advertise state_topic`)
}

loadNode('ha-mqtt-infrared', '', 'node-ha-mqtt-infrared')
const infraredConfig = lastConfig()
assert.strictEqual(infraredConfig.schema, 'emitter')
assert.ok(infraredConfig.command_topic, 'infrared emitter requires command_topic')
assert.ok(infraredConfig.state_topic, 'infrared receiver requires state_topic')

// MQTT scene has no state_topic in its schema.
published.length = 0
loadNode('ha-mqtt-scene', '', 'node-audit-scene')
const sceneConfig = lastConfig()
assert.ok(sceneConfig.command_topic)
assert.ok(!Object.prototype.hasOwnProperty.call(sceneConfig, 'state_topic'))

// MQTT tag scanner and device triggers do not support availability options.
for (const [type, id] of [['ha-mqtt-tag', 'node-audit-tag'], ['ha-mqtt-device_automation', 'node-audit-trigger']]) {
  published.length = 0
  loadNode(type, '', id)
  const config = lastConfig()
  assert.ok(!Object.prototype.hasOwnProperty.call(config, 'availability_topic'), `${type} must not advertise availability`)
  assert.ok(!Object.prototype.hasOwnProperty.call(config, 'payload_available'), `${type} must not advertise availability`)
  assert.ok(!Object.prototype.hasOwnProperty.call(config, 'payload_not_available'), `${type} must not advertise availability`)
  assert.ok(!published.some(item => item.payload === 'online' || item.payload === 'offline'))
}

// Siren commands arrive as JSON by default, but a plain ON/OFF template must not crash.
published.length = 0
loadNode('ha-mqtt-siren', '', 'node-audit-siren')
const sirenTopic = lastConfig().command_topic
const sirenCommand = subscribers[sirenTopic]
assert.ok(sirenCommand)
sirenCommand(sirenTopic, Buffer.from('ON'), {})
sirenCommand(sirenTopic, Buffer.from('{"state":"ON","tone":"bell"}'), {})
sirenCommand(sirenTopic, Buffer.from('null'), {})

// Zero-valued numeric states must be published, not dropped.
published.length = 0
loadNode('ha-mqtt-light', '', 'node-zero-light')
const lightConfig = lastConfig()
instances['node-zero-light']._input({ payload: 'ON', brightness: 0 })
assert.ok(published.some(item => item.topic === lightConfig.brightness_state_topic && item.payload === '0'))

loadNode('ha-mqtt-climate', '', 'node-zero-climate')
const climateConfig = lastConfig()
assert.ok(!Object.prototype.hasOwnProperty.call(climateConfig, 'power_command_topic'))
instances['node-zero-climate']._input({ payload: '21', temperature: 0 })
assert.ok(published.some(item => item.topic === climateConfig.temperature_state_topic && item.payload === '0'))

// Malformed image config must not abort discovery.
published.length = 0
loadNode('ha-mqtt-image', '{invalid', 'node-bad-image')
assert.ok(configMessages().length > 0)

// 0 and false are valid states; booleans must be serialized for MQTT.
published.length = 0
const probeNode = {
  id: 'probe',
  type: 'ha-mqtt-probe',
  config: '',
  server,
  on() { },
  send() { },
  status() { }
}
const probe = new HomeAssistant(probeNode, { name: 'Probe', config: '' }, device)
probe.publish('probe/topic', 0)
probe.publish('probe/topic', false)
assert.deepStrictEqual(published.map(item => item.payload), ['0', 'false'])
assert.strictEqual(probe.isEmpty(0), false)
assert.strictEqual(probe.isEmpty(false), false)
assert.strictEqual(probe.isEmpty(null), true)

// Closing a node marks it offline and does not remove the shared status subscription.
published.length = 0
instances['node-no-availability']._close(false, () => { })
const switchNode = instances['node-ha-mqtt-switch']
switchNode._close(false, () => { })
assert.ok(published.some(item => item.payload === 'offline'))
assert.ok(subscriptions.includes('homeassistant/status'))

// HA version gating: platforms introduced later are skipped with a visible status.
device.haVersion = '2024.1'
published.length = 0
loadNode('ha-mqtt-infrared', '', 'node-gated-infrared')
assert.strictEqual(configMessages().length, 0, 'infrared must be skipped on HA 2024.1')
assert.ok(instances['node-gated-infrared']._status.text.includes('does not support infrared'))

loadNode('ha-mqtt-valve', '', 'node-allowed-valve')
assert.ok(configMessages().length > 0, 'valve is supported from HA 2024.1')

// Attribute filtering also applies to hand-written entity configuration.
device.haVersion = '2022.12'
published.length = 0
loadNode('ha-mqtt-switch', JSON.stringify({ event_types: ['x'] }), 'node-attr-filter')
assert.ok(!Object.prototype.hasOwnProperty.call(lastConfig(), 'event_types'))

// Legacy binary sensor device class values are remapped only from 2022.9.
device.haVersion = 'latest'
published.length = 0
loadNode('ha-mqtt-binary_sensor', JSON.stringify({ device_class: 'cool' }), 'node-value-latest')
assert.strictEqual(lastConfig().device_class, 'cold')

device.haVersion = '2021.12'
published.length = 0
loadNode('ha-mqtt-binary_sensor', JSON.stringify({ device_class: 'cool' }), 'node-value-old')
assert.strictEqual(lastConfig().device_class, 'cool')
device.haVersion = 'latest'

// Translation catalogs must stay key-symmetric between en-US and zh.
function collectLocaleFiles(dir, result = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === 'node_modules') continue
    if (entry.name === 'locales') {
      for (const lang of ['en-US', 'zh']) {
        const langDir = path.join(dir, 'locales', lang)
        if (!fs.existsSync(langDir)) continue
        for (const file of fs.readdirSync(langDir).filter(name => name.endsWith('.json'))) {
          result.push({
            key: path.relative(root, path.join(dir, 'locales')) + '/' + file,
            lang,
            file: path.join(langDir, file)
          })
        }
      }
    } else {
      collectLocaleFiles(path.join(dir, entry.name), result)
    }
  }
  return result
}

function leafKeys(value, prefix = '') {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.keys(value).reduce(
      (acc, key) => acc.concat(leafKeys(value[key], prefix ? prefix + '.' + key : key)), [])
  }
  return [prefix]
}

const catalogs = {}
for (const item of collectLocaleFiles(root)) {
  if (!catalogs[item.key]) catalogs[item.key] = {}
  catalogs[item.key][item.lang] = item.file
}
for (const [name, pair] of Object.entries(catalogs)) {
  assert.ok(pair['en-US'] && pair.zh, `${name} is missing a language catalog`)
  const en = leafKeys(JSON.parse(fs.readFileSync(pair['en-US'], 'utf8'))).sort()
  const zh = leafKeys(JSON.parse(fs.readFileSync(pair.zh, 'utf8'))).sort()
  assert.deepStrictEqual(zh, en, `${name} has mismatched translation keys`)
}

// Every i18n reference must resolve to a key in one of the catalogs.
const knownKeys = new Set()
for (const item of collectLocaleFiles(root)) {
  if (item.lang !== 'en-US') continue
  const namespace = path.basename(item.file, '.json')
  for (const key of leafKeys(JSON.parse(fs.readFileSync(item.file, 'utf8')))) {
    knownKeys.add(namespace + ':' + key)
  }
}
function checkTranslationKey(key, file) {
  const normalized = key.replace(/^node-red-contrib-ha-mqtt\//, '')
  assert.ok(knownKeys.has(normalized), `${file} references missing translation: ${key}`)
}
for (const file of Object.values(pkg['node-red'].nodes)) {
  const htmlFile = file.replace(/\.js$/, '.html')
  const html = fs.readFileSync(path.join(root, htmlFile), 'utf8')
  for (const ref of html.match(/data-i18n="(?:\[[^\]]+\])?[^"]+"/g) || []) {
    checkTranslationKey(ref.replace(/^data-i18n="(?:\[[^\]]+\])?/, '').replace(/"$/, ''), htmlFile)
  }
  for (const ref of html.match(/RED\._\(["'][^"']+["']\)/g) || []) {
    checkTranslationKey(ref.replace(/^RED\._\(["']/, '').replace(/["']\)$/, ''), htmlFile)
  }
}
for (const file of Object.values(pkg['node-red'].nodes)) {
  const js = fs.readFileSync(path.join(root, file), 'utf8')
  for (const ref of js.match(/RED\._\(["'`][^"'`]+["'`]\)/g) || []) {
    checkTranslationKey(ref.replace(/^RED\._\(["'`]/, '').replace(/["'`]\)$/, ''), file)
  }
}

// All entities share one HA birth subscription, avoiding N x N rediscovery.
assert.strictEqual(subscriptions.filter(topic => topic === 'homeassistant/status').length, 1)

// Every version boundary in the compat table must be selectable in the device editor.
const haSource = fs.readFileSync(path.join(root, 'HomeAssistant.js'), 'utf8')
const tableBlock = haSource.slice(
  haSource.indexOf('const PLATFORM_MIN_VERSION'),
  haSource.indexOf('// Discovery attributes'))
const tableVersions = [...tableBlock.matchAll(/'([0-9.]+)'/g)].map(match => match[1])
const editorSource = fs.readFileSync(path.join(root, 'device/device.html'), 'utf8')
const editorVersions = [...editorSource.matchAll(/<option value="([0-9.]+)"/g)].map(match => match[1])
for (const version of new Set(tableVersions)) {
  assert.ok(editorVersions.includes(version), `device editor is missing HA version option ${version}`)
}

console.log('smoke tests passed')
