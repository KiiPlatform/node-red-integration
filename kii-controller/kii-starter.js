module.exports = function(RED) {
    function KiiStarter(n) {
        this.kiiApp = RED.nodes.getNode(n.kiiApp);
        RED.nodes.createNode(this,n);
        this.on("input",function(msg) {
            var request = require("request");

            var options = {
                method: 'POST',
                url: this.kiiApp.appSite + '/oauth2/token',
                headers: {
                    'content-type': 'application/json',
                    'x-kii-appkey': this.kiiApp.appKey,
                    'x-kii-appid': this.kiiApp.appID
                },
                body: {
                    client_id: this.kiiApp.clientID,
                    client_secret: this.kiiApp.clientSecret
                },
                json: true
            };

            request(options, function(error, response, body) {
                if (error) throw new Error(error);
                process.env.ADMINTOKEN = body.access_token;
            });
            msg.payload = {
                app: {
                    appSite: this.kiiApp.appSite,
                    appID: this.kiiApp.appID,
                    appKey: this.kiiApp.appKey
                }
            }
            this.send(msg);
            msg = null;
        });
    }

    RED.nodes.registerType("kii-starter",KiiStarter);

    RED.httpAdmin.post("/inject/:id", RED.auth.needsPermission("inject.write"), function(req,res) {
        var node = RED.nodes.getNode(req.params.id);
        if (node != null) {
            try {
                node.receive();
                res.sendStatus(200);
            } catch(err) {
                res.sendStatus(500);
                node.error(RED._("inject.failed",{error:err.toString()}));
            }
        } else {
            res.sendStatus(404);
        }
    });
}
