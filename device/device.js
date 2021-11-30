module.exports = function(RED) {
    function HaDeviceNode(n) {
        RED.nodes.createNode(this,n);
        this.name = n.name;
        this.identifiers = n.identifiers;
    }
    RED.nodes.registerType("ha_device", HaDeviceNode);
}