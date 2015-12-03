module.exports = function(RED) {
	function KiiThing(n) {
		RED.nodes.createNode(this, n);
		this.displayName = n.displayName;
		this.vendorThingID = n.vendorThingID;
		this.password = n.password;
	}
	RED.nodes.registerType("kii-thing", KiiThing);
}