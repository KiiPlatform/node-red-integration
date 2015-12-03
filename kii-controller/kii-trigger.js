module.exports = function(RED) {
    function KiiTrigger(n) {
        this.kiiThingSource = RED.nodes.getNode(n.kiiThingSource);
        this.kiiThingTarget = RED.nodes.getNode(n.kiiThingTarget);
        RED.nodes.createNode(this,n);
        var node = this;
        this.on("input",function(msg) {
            var request = require('request');

            var vendorThingSourceID = this.kiiThingSource.vendorThingID;
            var vendorThingTargetID = this.kiiThingTarget.vendorThingID;
            var userAccessToken = msg.payload.user.accessToken;
            var userID = msg.payload.user.userID;
            var appID = msg.payload.app.appID;
            var appSite = msg.payload.app.appSite;
            var condition = JSON.parse(n.condition);
            var actions = JSON.parse(n.template);
            var title = n.title;
            var description = n.description;

            var options = {
                method: 'POST',
                url: appSite.substring(0, appSite.length - 4) + '/thing-if/apps/' + appID + 
                    '/targets/THING:' + process.env['THING_' + vendorThingSourceID] + '/triggers',
                headers: {
                    'content-type': 'application/json',
                    authorization: 'Bearer ' + userAccessToken
                },
                body: {
                    title: title,
                    description: description,
                    predicate: {
                        eventSource: 'states',
                        triggersWhen: 'CONDITION_FALSE_TO_TRUE',
                        condition: condition
                    },
                    command: {
                        issuer: 'USER:' + userID,
                        target: 'THING:' + process.env['THING_' + vendorThingTargetID],
                        schema: 'RedNodeEdisonLED',
                        schemaVersion: 1,
                        actions: actions
                    }
                },
                json: true
            };

            request(options, function(error, response, body) {
                if (error) throw new Error(error);
                if (response.statusCode == 201) {
                    msg.payload = {
                        message: "Trigger successfully set.",
                        body: body
                    }
                    node.send(msg);
                } else {
                    msg.payload = {
                        message: "Having problem setting trigger.",
                        body: body
                    }
                    node.send(msg);
                }
            });            
        });
    }
    RED.nodes.registerType("Kii Trigger",KiiTrigger);
}
