module.exports = function(RED) {
    function KiiCommand(n) {
        this.kiiThing = RED.nodes.getNode(n.kiiThing);
        RED.nodes.createNode(this,n);
        var node = this;
        this.on("input",function(msg) {
            var request = require('request');

            var vendorThingID = this.kiiThing.vendorThingID;
            var userAccessToken = msg.payload.user.accessToken;
            var userID = msg.payload.user.userID;
            var appID = msg.payload.app.appID;
            var appSite = msg.payload.app.appSite;

            var actions = JSON.parse(n.template);

            var options = {
                method: 'POST',
                url: appSite.substring(0, appSite.length - 4) + '/thing-if/apps/' + appID + 
                    '/targets/THING:' + process.env['THING_' + vendorThingID] + '/commands',
                headers: {
                    'content-type': 'application/json',
                    authorization: 'Bearer ' + userAccessToken
                },
                body: {
                    schemaVersion: 1,
                    schema: 'RedNodeEdisonLED',
                    issuer: 'user:' + userID,
                    actions: actions
                },
                json: true
            };

            request(options, function(error, response, body) {
                if (error) throw new Error(error);
                if (response.statusCode == 201) {
                    msg.payload = {
                        message: 'Control Command successfully sent!',
                        body: body
                    }
                    node.send(msg);
                } else {
                    msg.payload = {
                        message: 'Having Problem sending command',
                        body: body
                    }
                    node.send(msg)
                }
            });
            
        });
    }
    RED.nodes.registerType("Kii Command",KiiCommand);
}
