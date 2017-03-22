'use strict';

var getOptions = function(){ 
	var options = {
	 	hostname: "paceapi.homesitep2.com",
	    port: "443",
	    headers: {
	      "User-Agent": "MyLambda/1.0.0 ( steve@ibm.com )",
	      "Authorization": "Bearer 934b3c95f52e541a596df1eb21ed2127",
		  "Content-Type": "application/json"
	    }
	};
	
	return options;
};

module.exports = {

	getBalance: function(){
		var options = getOptions();
		options.method ="GET";
		options.path = "/billing";
		//options.url = "https://paceapi.homesitep2.com/billing";
		return options;
	},
	postPayment: function(){
		var options = getOptions();
		options.method = "POST";
		options.path = "/billing/payments";
		return options;
	}
    sendConfirmation: function (data) {
        var options = getOptions();
        options.method = "POST";
        options.path = "/billing/confirmation";
        return options;
    }
}