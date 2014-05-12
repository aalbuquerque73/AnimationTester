define([],
function() {
	var isNodeWebkit = (typeof process == "object" && typeof(process.versions['node-webkit']) !== "undefined");

	if (isNodeWebkit) {
	    console.log( 'in node-webkit v ' + process.versions['node-webkit']);
	    return require('http');
	}
	
	return {
		request: function() {
			return {
				setEncoding: function() {},
				on: function() {},
				write: function() {},
				end: function() {}
			};
		}
	};
});