'use strict';

var getOptions = function(){
	var options = {
	 	hostname: "paceapi.homesitep2.com",
	    port: "443",
	    headers: {
	      "User-Agent": "MyLambda/1.0.0 ( steve@ibm.com )",
	      "Authorization": "Bearer 5fcef407807365c684f0bdefb9819d3c"
	    }
	};
	return options;
};

module.exports = {

	getBilling: function(){
		var options = getOptions();
		options.method ="GET";
		options.path = "/billing";
		return options;
	},
	postPayment: function(){
		var options = getOptions();
		options.method ="POST";
		options.path = "/billing/payment";
		return options;
	}
}