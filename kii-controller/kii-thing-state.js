module.exports = function(RED) {
    function KiiThingState(n) {
        this.kiiThing = RED.nodes.getNode(n.kiiThing);
        RED.nodes.createNode(this,n);
        var node = this;
        this.on("input",function(msg) {
            var request = require('request');

            var vendorThingID = this.kiiThing.vendorThingID;
            var userAccessToken = msg.payload.user.accessToken;
            var appID = msg.payload.app.appID;
            var appSite = msg.payload.app.appSite;

            var options = { method: 'GET',
                url: appSite.substring(0, appSite.length - 4) + '/thing-if/apps/' + appID + 
                    '/targets/THING:' + process.env['THING_' + vendorThingID] + '/states',
                headers: {
                    authorization: 'Bearer ' + userAccessToken,
                    'content-type': 'application/json'
                }
            };

            request(options, function(error, response, body) {
                if (error) throw new Error(error);
                if (response.statusCode == 200) {
                    msg.payload = JSON.parse(body);
                    node.send(msg)
                } else {
                    msg.payload = {
                        message: "Having problem getting thing state",
                        body: body
                    }
                    node.send(msg);
                }
            });

        });
    }
    RED.nodes.registerType("Kii Thing State",KiiThingState);
}
