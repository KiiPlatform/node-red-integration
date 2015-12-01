module.exports = function(RED) {
  function KiiThingNew(config) {
    RED.nodes.createNode(this,config);
    this.vendorThingID = config.vendorThingID;
    this.password = config.password;
    var node = this;
    this.on('input', function(msg) {
      msg.payload = {
        "vendorThingID": node.vendorThingID,
        "password": node.password
      }
      node.send(msg);
    });
  }
  RED.nodes.registerType("kii-thing-new",KiiThingNew);
}
