module.exports = function(RED) {

    var http = require("https");
    var fs = require("fs");
    var mqtt = require("mqtt");

    function KiiOnboardingThing(config) {
        RED.nodes.createNode(this, config);
        this.site = config.site;
        this.appID = config.appID;
        this.appKey = config.appKey;
        this.vendorThingID = config.vendorThingID;
        this.thingPassword = config.thingPassword;
        this.thingType = config.thingType;
        var node = this;
        this.on("input", function(msg) {
            // node.log("##### mqtt=" + JSON.stringify(mqtt));
            if (!msg.site) {
                msg.site = node.site;
            }
            if (!msg.appID) {
                msg.appID = node.appID;
            }
            if (!msg.appKey) {
                msg.appKey = node.appKey;
            }
            if (!msg.vendorThingID) {
                msg.vendorThingID = node.vendorThingID;
            }
            if (!msg.thingPassword) {
                msg.thingPassword = node.thingPassword;
            }
            if (!msg.thingType) {
                msg.thingType = node.thingType;
            }
            var filename = "kii-" + msg.vendorThingID + ".json";
            fs.readFile(filename, {encoding: "utf-8"}, function (err, data) {
                if (err) {
                    // file doesn't exist
                    var host = "";
                    if (msg.site == "us") {
                        host = "api.kii.com";
                    } else if (msg.site == "jp") {
                        host = "api-jp.kii.com";
                    } else if (msg.site == "cn") {
                        host = "api-cn3.kii.com";
                    } else if (msg.site == "sg") {
                        host = "api-sg.kii.com";
                    }
                    var postdata = JSON.stringify({
                        "vendorThingID": msg.vendorThingID,
                        "thingPassword": msg.thingPassword
                    });
                    var options = {
                        hostname: host,
                        port: 443,
                        path: "/thing-if/apps/" + msg.appID + "/onboardings",
                        method: "POST",
                        headers: {
                            "Content-Type": "application/vnd.kii.OnboardingWithVendorThingIDByThing+json",
                            "Content-Length": Buffer.byteLength(postdata),
                            "X-Kii-AppID": msg.appID,
                            "X-Kii-AppKey": msg.appKey,
                            "Authorization": "Basic " + new Buffer(msg.appID + ":" + msg.appKey).toString("base64")
                        }
                    };
                    var responseBody = "";
                    var request = http.request(options, function(response) {
                        response.on('data', function (chunk) {
                            responseBody += chunk;
                        });
                        response.on('end',function() {
                            var json = JSON.parse(responseBody);
                            msg.thingID = json.thingID;
                            msg.accessToken = json.accessToken;
                            msg.mqttEndpoint = json.mqttEndpoint;
                            // context.global = {};
                            // context.global.kii = {};
                            // context.global.kii.site = msg.site;
                            // context.global.kii.host = host;
                            // context.global.kii.appID = msg.appID;
                            // context.global.kii.appKey = msg.appKey;
                            // context.global.kii.vendorThingID = msg.vendorThingID;
                            // context.global.kii.thingType = msg.thingType;
                            // context.global.kii.thingID = msg.thingID;
                            // context.global.kii.accessToken = msg.accessToken;
                            // context.global.kii.mqttEndpoint = msg.mqttEndpoint;
                            fs.writeFile(filename, JSON.stringify(msg));
                            node.send(msg);
                        });
                    });
                    request.write(postdata);
                    request.end();
                } else {
                    var json = JSON.parse(data);
                    msg.thingID = json.thingID;
                    msg.accessToken = json.accessToken;
                    node.send(msg);
                }
            });
        });
    }
    RED.nodes.registerType("kii-onboarding-thing", KiiOnboardingThing);
    function KiiMqttReceiver(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var client = null;
        this.on("input", function(msg) {
            node.log("###### 1=" + msg);
            node.log("###### 2=" + JSON.stringify(msg));
            var options = {
                port: msg.mqttEndpoint.portTCP,
                clientId: msg.mqttEndpoint.mqttTopic,
                username: msg.mqttEndpoint.username,
                password: msg.mqttEndpoint.password
            };
            client = mqtt.connect("tcp://" + msg.mqttEndpoint.host, options);
            client.on('connect', function () {
                node.log("##### mqtt connected!!");
                client.subscribe(msg.mqttEndpoint.mqttTopic);
            });
            client.on('message', function (topic, message) {
                node.log("##### received message!! msg=" + message);
            });
        });
    }
    RED.nodes.registerType("kii-mqtt-receiver", KiiMqttReceiver);
}

    // "topic": "",
    // "payload": 1448935794216,
    // "_msgid": "8f392a58.70c6d8",
    // "site": "us",
    // "appID": "5b8d7fc2",
    // "appKey": "c6a72bcd9836399f943d3798c7f3719f",
    // "vendorThingID": "1234-5678-abc-dei1",
    // "thingPassword": "password",
    // "thingType": "",
    // "thingID": "th.bb149fa00022-d4ca-5e11-bc79-02dcef5f",
    // "accessToken": "QDendRpcdhrm1aI62tOa1x66wLRjlrNxWDBtvToTbR4",
    // "mqttEndpoint": {
    //     "installationID": "v95ztbzvpfg0curba58pq6is8",
    //     "username": "5b8d7fc2-NUjCgvNQE2vPLqwkcfm2Ghx",
    //     "password": "RBEoyoINKyWeoJTTrrTtcyiINBVkMlVWrLVBHxKhQjgcgjJzeNcFuaCfxFIoaJRP",
    //     "mqttTopic": "hJrBrz5bosv3pLFUDmtd0xT",
    //     "host": "us-mqtt-22a98aeb8c69.kii.com",
    //     "portTCP": 1883,
    //     "portSSL": 8883,
    //     "ttl": 2147483647
    // }
