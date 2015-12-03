module.exports = function(RED) {
	function KiiSite(n) {
		RED.nodes.createNode(this, n);
		this.siteName = n.siteName;
		this.apiURL = n.apiURL;
	}
	RED.nodes.registerType("kii-site", KiiSite);
}