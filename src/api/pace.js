'use strict';

var getOptions = function(token){ 
	var options = {
	 	hostname: "paceapi.homesitep2.com",
	    port: "443",
	    headers: {
	      "User-Agent": "MyLambda/1.0.0 ( steve@ibm.com )",
	      "Authorization": "Bearer " + token,
		  "Content-Type": "application/json"
	    }
	};
	
	return options;
};

module.exports = {

	getBalance: function(token){
		var options = getOptions(token);
		options.method ="GET";
		options.path = "/billing";
		//options.url = "https://paceapi.homesitep2.com/billing";
		return options;
	},
	postPayment: function(token){
		var options = getOptions(token);
		options.method = "POST";
		options.path = "/billing/payments";
		return options;
	},
    sendConfirmation: function (token) {
        var options = getOptions(token);
        options.method = "POST";
        options.path = "/billing/confirmation";
        return options;
    }
}