module.exports = function(RED) {

    var http = require("https");
    var mqtt = require("mqtt");
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

    var kiiContext = null;

    // shared functions
    function updateState(node, stateObject) {
      var putdata = JSON.stringify(stateObject);
      var options = {
          hostname: kiiContext.host,
          port: 443,
          path: "/thing-if/apps/" + kiiContext.appID + "/targets/thing:" + kiiContext.thingID + "/states",
          method: "PUT",
          headers: {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(putdata),
              "X-Kii-AppID": kiiContext.appID,
              "X-Kii-AppKey": kiiContext.appKey,
              "Authorization": "Bearer " + kiiContext.accessToken
          }
      };
      var request = http.request(options, function(response) {
          response.on('data', function (chunk) {
          });
          response.on('end',function() {
              node.log("##### Status is updated!!  " + putdata);
          });
      });
      request.on('error', function(e) {
          node.error("Failed to update status", e.message);
      });
      request.write(putdata);
      request.end();
    }
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
            msg.host = host;
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
                    node.log("##### onboarded res=" + responseBody);
                    var json = JSON.parse(responseBody);
                    msg.thingID = json.thingID;
                    msg.accessToken = json.accessToken;
                    msg.mqttEndpoint = json.mqttEndpoint;
                    kiiContext = msg;
                    node.send(msg);
                });
            });
            request.on('error', function(e) {
                node.error("Failed to onboard", e.message);
            });
            request.write(postdata);
            request.end();
        });
    }
    RED.nodes.registerType("Kii Onboard Thing", KiiOnboardingThing);


    function KiiCommandReceiver(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var client = null;
        this.on("input", function(msg) {
            var options = {
                port: kiiContext.mqttEndpoint.portTCP,
                clientId: kiiContext.mqttEndpoint.mqttTopic,
                username: kiiContext.mqttEndpoint.username,
                password: kiiContext.mqttEndpoint.password
            };
            if (client != null) {
                node.log("##### close connection");
                client.end();
            }
            client = mqtt.connect("tcp://" + kiiContext.mqttEndpoint.host, options);
            client.on('connect', function (packet) {
                if (!packet.sessionPresent) {
                    node.log("##### mqtt connected!!");
                    client.subscribe(kiiContext.mqttEndpoint.mqttTopic);
                    node.log("##### mqtt subscribed " + kiiContext.mqttEndpoint.mqttTopic);
                }
            });
            client.on('message', function (topic, message) {
                node.log("##### received message!! msg=" + message);
                // handle command by assign actions to msg.payload
                var msg = JSON.parse(message);
                msg.payload= {
                  actions: msg.actions
                };
                delete msg.actions;
                node.send(msg);
            });
        });
    }
    RED.nodes.registerType("Kii Command Receiver", KiiCommandReceiver);

    function KiiStateUploader(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        this.on("input", function(msg) {
          updateState(node, msg.payload);
        });
    }

    RED.nodes.registerType("Kii State Uploader", KiiStateUploader);


    function ActionResultSender(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        this.on("input", function(msg) {
            if (msg == null || msg == undefined) {
              node.log("msg is null, nothing to send");
              return;
            }
            var putdata = JSON.stringify(msg.payload);
            var options = {
                hostname: kiiContext.host,
                port: 443,
                path: "/thing-if/apps/" + kiiContext.appID + "/targets/thing:" + kiiContext.thingID + "/commands/" + msg.commandID + "/action-results",
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(putdata),
                    "X-Kii-AppID": kiiContext.appID,
                    "X-Kii-AppKey": kiiContext.appKey,
                    "Authorization": "Basic " + kiiContext.accessToken
                }
            };
            var request = http.request(options, function(response) {
                response.on('data', function (chunk) {
                });
                response.on('end',function() {
                    node.log("##### Command result is updated!!  " + putdata);
                    // if there is state data on msg.payload, then update state
                    var stateData = msg.thingState;
                    if (stateData != null || stateData != undefined) {
                      updateState(node, stateData);
                    }
                });
            });
            request.on('error', function(e) {
                node.error("Failed to update command result", e.message);
            });
            request.write(putdata);
            request.end();
        });
    }
    RED.nodes.registerType("Kii ActionResults Sender", ActionResultSender);
}
