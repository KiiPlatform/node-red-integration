module.exports = function(RED) {
	function KiiApp(n) {
		RED.nodes.createNode(this, n);
		this.appName = n.appName;
		this.appID = n.appID;
		this.appKey = n.appKey;
		this.appSite = n.appSite;
	}
	RED.nodes.registerType("kii-app", KiiApp);
}