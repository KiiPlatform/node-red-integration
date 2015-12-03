// module.exports = function(RED) {
//     function KiiThingOnline(n) {
//         this.kiiThing = RED.nodes.getNode(n.kiiThing);
//         RED.nodes.createNode(this,n);
//         var node = this;
//         this.on("input",function(msg) {
//             var request = require('request');

//             var vendorThingID = this.kiiThing.vendorThingID;
//             var appID = msg.payload.app.appID;
//             var appKey = msg.payload.app.appKey;
//             var appSite = msg.payload.app.appSite;

//             var options = {
//                 method: 'POST',
//                 url: appSite + '/apps/4a16650f/things/query',
//                 headers: {
//                     'content-type': 'application/vnd.kii.thingqueryrequest+json',
//                     authorization: 'Bearer ' + process.env.ADMINTOKEN,,
//                     'x-kii-appkey': appKey,
//                     'x-kii-appid': appID
//                 },
//                 body: JSON.parse({
//                     "thingQuery": {
//                         "clause": {
//                             "type": "eq",
//                             "field": "_thingID",
//                             "value": process.env['THING_' + vendorThingID]
//                         },
//                         "orderBy": "_created",
//                         "descending": false

//                     },
//                     "bestEffortLimit": 200
//                 })
//             };

//             request(options, function(error, response, body) {
//                 if (error) throw new Error(error);

//                 console.log(body);
//             });            
//         });
//     }
//     RED.nodes.registerType("Kii Thing Online",KiiThingOnline);
// }
module.exports = function(RED) {
    function KiiThingOnline(n) {
        this.kiiThing = RED.nodes.getNode(n.kiiThing);
        RED.nodes.createNode(this,n);
        var node = this;
        this.on("input",function(msg) {
            var request = require('request');

            var vendorThingID = this.kiiThing.vendorThingID;
            var appID = msg.payload.app.appID;
            var appKey = msg.payload.app.appKey;
            var appSite = msg.payload.app.appSite;

            var options = {
                method: 'POST',
                url: appSite + '/apps/' + appID + '/things/query',
                headers: {
                    'content-type': 'application/vnd.kii.thingqueryrequest+json',
                    authorization: 'Bearer ' + process.env.ADMINTOKEN,
                    'x-kii-appkey': appKey,
                    'x-kii-appid': appID
                },
                body: JSON.stringify({
                    "thingQuery": {
                        "clause": {
                            "type": "eq",
                            "field": "_thingID",
                            "value": process.env['THING_' + vendorThingID]
                        },
                        "orderBy": "_created",
                        "descending": false

                    },
                    "bestEffortLimit": 200
                })
            };

            request(options, function(error, response, body) {
                if (error) throw new Error(error);
                if (response.statusCode == 200) {
                    console.log(body);
                }
            });            

        });
    }

    RED.nodes.registerType("Kii Thing Online",KiiThingOnline);
}
