module.exports = function(RED) {
  function KiiThingOnboard(config) {
    RED.nodes.createNode(this,config);
    this.appID = config.appID;
    this.appKey = config.appKey;
    var node = this;
    this.on('input', function(msg) {
      var vendorThingID = msg.vendorThingID;
      var password = msg.vendorThingID;
      var appID = node.appID;
      var appKey = node.appKey;
      process.env.KIIAPPID = appID;
      process.env.KIIAPPKEY = appKey;

      var request = require('request');
      var options = {
        method: 'POST',
        url: 'https://api-jp.kii.com/api/apps/' + appID + '/oauth2/token',
        headers: {
          'content-type': 'application/json',
          'x-kii-appkey': appKey,
          'x-kii-appid': appID
        },
        body: {
          grant_type: 'client_credentials',
          client_id: appID,
          client_secret: appKey
        },
        json: true
      };
      //create a pseudo user
      request(options, function (error, response, body) {
        if (error) throw new Error(error);
        var authorization = body.token_type + ' ' + body.access_token;

        var options = {
          method: 'POST',
          url: 'https://api-jp.kii.com/thing-if/apps/' + appID + '/onboardings',
          headers: {
            authorization: authorization,
            'content-type': 'application/vnd.kii.OnboardingWithVendorThingIDByThing+json',
            'x-kii-appkey': appKey,
            'x-kii-appid': appID
          },
          body: '{"vendorThingID":"' + vendorThingID + '","thingPassword":"' + password + '"}'
        };

        //use the access token of pseudo user to onboard by thing
        request(options, function (error, response, body) {
          if (error) throw new Error(error);
          var thingAccessToken = body.accessToken;
          process.env.KIITHINGACCESSTOKEN = thingAccessToken;
          msg.payload = body;
          node.send(msg);
        });

      });
    });
  }
  RED.nodes.registerType("kii-thing-onboard",KiiThingOnboard);
}
