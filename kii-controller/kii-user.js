module.exports = function(RED) {
    function KiiUser(config) {                
        RED.nodes.createNode(this, config);
        var node = this;        
        this.on('input', function(msg) {
            var request = require('request');
            var username = config.username;
            var password = config.password;
            var appSite = msg.payload.app.appSite;
            var appID = msg.payload.app.appID;
            var appKey = msg.payload.app.appKey;

            var options = {
                method: 'POST',
                url: appSite + '/apps/' + appID + '/users',
                headers: {
                    'content-type': 'application/vnd.kii.RegistrationAndAuthorizationRequest+json',
                    'x-kii-appkey': appKey,
                    'x-kii-appid': appID
                },
                body: JSON.stringify({
                    loginName: username,
                    password: password
                })
            };

            request(options, function(error, response, body) {
                if (error) throw new Error(error);
                if (response.statusCode == 201){
                    msg.payload = {
                        app: msg.payload.app,
                        user: {
                            userID: JSON.parse(body).userID,
                            accessToken: JSON.parse(body)._accessToken
                        }
                    }
                    node.send(msg);
                } else if (response.statusCode == 409){
                    var options = {
                        method: 'POST',
                        url: appSite + '/oauth2/token',
                        headers: {
                            'content-type': 'application/json',
                            'x-kii-appkey': appKey,
                            'x-kii-appid': appID
                        },
                        body: {
                            username: username,
                            password: password
                        },
                        json: true
                    };
                    request(options, function(error, response, body) {
                        if (error) throw new Error(error);
                        if (response.statusCode == 200){
                            msg.payload = {
                                app: msg.payload.app,
                                user: {
                                    userID: body.id,
                                    accessToken: body.access_token
                                }
                            }
                            node.send(msg);
                        } else {
                            msg.payload = "Having problem with user login";
                            node.send(msg);
                        }                     
                    });
                } else {
                    msg.payload = "Having problem with registering user";
                    node.send(msg);
                }         
            });
        });
    }
    RED.nodes.registerType("Kii User", KiiUser);
}