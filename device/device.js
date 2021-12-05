module.exports = function(RED) {
    function HaDeviceNode(n) {
        RED.nodes.createNode(this,n);
        this.name = n.name;
        this.identifiers = JSON.parse(n.identifiers);
    }
    RED.nodes.registerType("ha-device", HaDeviceNode);
}