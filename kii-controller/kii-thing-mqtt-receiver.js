module.exports = function(RED) {
  function KiiThingMQTTReceiver(config) {
    RED.nodes.createNode(this,config);
    this.status({fill:"red",shape:"ring",text:"disconnected"});
    var node = this;
    this.on('input', function(msg) {
      var mqtt = require('mqtt');
      var thingAccessToken = JSON.parse(msg.payload).accessToken;
      var mqttEndpoint = JSON.parse(msg.payload).mqttEndpoint;
      var client  = mqtt.connect('tcp://' + mqttEndpoint.host,
      {
        "port": mqttEndpoint.portTCP,
        "clientId": mqttEndpoint.mqttTopic,
        "username": mqttEndpoint.username,
        "password": mqttEndpoint.password
      });
      client.on('connect', function (connack) {
        console.log('connection success')
        node.status({fill:"green",shape:"dot",text:"connected"});
      });
      client.on('error', function(error){
        console.log(error)
      })
      client.on('message', function(topic, message, packet){
        console.log(message)
      })
    });
  }
  RED.nodes.registerType("kii-thing-mqtt-receiver",KiiThingMQTTReceiver);
}
