module.exports = function(RED) {

    var http = require("https");
    var fs = require("fs");
    var mqtt = require("mqtt");
    function ActionHandler(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        this.on("input", function(msg) {
          // the payload should contain actions array
          var putdata = JSON.stringify(msg.payload);
          var actions = msg.payload.actions;
          var expectedActionName = config.action;
          if (actions == null || actions == undefined) {
            node.err("Not contain actions in payload");
            node.send([null,{}]);
            return;
          }
          for(var i in actions) {
            var action = actions[i];
            // only support one key-value in action, and one key-value in change, like:
            // {"turnPower": {"power": true}}
            var actionName = Object.keys(action)[0];
            if (actionName == expectedActionName) {
              var change = Object.keys(action[actionName])[0];
              var changeValue = action[actionName][change];

              // msg1 for action result
              var msg1_payload = {};
              msg1_payload[actionName]={
                result: changeValue
              };
              var msg1 = {
                commandID: msg.commandID,
                payload: msg1_payload
              };

              // msg2 for device control
              var msg2 ={
                payload: changeValue
              }
              node.send([msg1, msg2]);
              return
            }
          }
          // there is no action matched
          node.log("no action matched in Kii Action Handler");
          node.send([null,{}]);

        });
    }
    RED.nodes.registerType("Kii Action Handler", ActionHandler);

}
