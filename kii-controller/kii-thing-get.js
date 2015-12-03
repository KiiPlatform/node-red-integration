module.exports = function(RED) {
    function KiiThingGet(n) {
        this.kiiThing = RED.nodes.getNode(n.kiiThing);
        RED.nodes.createNode(this,n);
        var node = this;
        this.on("input",function(msg) {
            var request = require('request');

            var vendorThingID = this.kiiThing.vendorThingID;
            var userAccessToken = msg.payload.user.accessToken;
            var appID = msg.payload.app.appID;
            var appKey = msg.payload.app.appKey;
            var appSite = msg.payload.app.appSite;

            var options = {
                method: 'GET',
                url: appSite + '/apps/' + appID + '/things/VENDOR_THING_ID:' + vendorThingID,
                headers: {
                    'x-kii-appkey': appKey,
                    'x-kii-appid': appID,
                    authorization: 'Bearer ' + userAccessToken
                }
            };

            request(options, function(error, response, body) {
                if (error) throw new Error(error);
                if (response.statusCode == 200) {
                    msg.payload = JSON.parse(body);
                    node.send(msg);
                } else {
                    msg.payload = {
                        message: "Having problem getting thing attributes",
                        body: body
                    }
                }


            });
        });
    }
    RED.nodes.registerType("Kii Thing Get",KiiThingGet);
}
