module.exports = function(RED) {
    function KiiOwnership(n) {
        this.kiiThing = RED.nodes.getNode(n.kiiThing);
        RED.nodes.createNode(this,n);
        var node = this;
        this.on("input",function(msg) {
            var request = require('request');

            var vendorThingID = this.kiiThing.vendorThingID;
            var password = this.kiiThing.password;
            var userID = msg.payload.user.userID;
            var userAccessToken = msg.payload.user.accessToken;
            var appID = msg.payload.app.appID;
            var appSite = msg.payload.app.appSite;

            var options = {
                method: 'POST',
                url: appSite.substring(0, appSite.length - 4) + '/thing-if/apps/bfda2647/onboardings',
                headers: {
                    authorization: 'Bearer ' + userAccessToken,
                    'content-type': 'application/vnd.kii.onboardingWithVendorThingIDByOwner+json'
                },
                body: JSON.stringify({
                    vendorThingID: vendorThingID,
                    thingPassword: password,
                    owner: 'USER:' + userID
                })
            };
            console.log(options)

            request(options, function(error, response, body) {
                if (error) throw new Error(error);
                if (response.statusCode == 200 || response.statusCode == 201) {
                    msg.payload = "Ownership Built, Now you can try other thing operations."
                    process.env['THING_' + vendorThingID] = JSON.parse(body).thingID;
                    node.send(msg);
                } else {
                    msg.payload = {
                        message: "Error during building ownership",
                        error: error,
                        response: response.statusCode
                    }
                    node.send(msg);
                }          
            });
        });
    }

    RED.nodes.registerType("Kii Ownership",KiiOwnership);
}
