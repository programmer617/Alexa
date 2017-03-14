"use strict";
var APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).
var Alexa = require("alexa-sdk");
var https = require("https");
var PACE = require("./api/pace");

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
	alexa.registerHandlers(balanceHandlers);
    alexa.execute();
};

var balanceHandlers = {
    "BalanceIntent": function(){
		// Call Pace Billing
		const req = https.request(PACE.getBilling(), (res) => {
			let body = '';
			console.log('Status:', res.statusCode);
			console.log('Headers:', JSON.stringify(res.headers));
			res.setEncoding('utf8');
			res.on('data', (chunk) => body += chunk);
			res.on('end', () => {
				console.log('Successfully processed HTTPS response');
				// If we know it's JSON, parse it
				if (res.headers['content-type'] === 'application/json') {
					body = JSON.parse(body);
					console.log('Body: ', body);
					var speechOutput = "Your balance is $" + body.balance/100;		
					speechOutput += " with your next payment of $" + body.amount_due/100;
					speechOutput += " due on " + body.next_payment_date;
					this.emit(":tell",speechOutput);
				}
			});
		});
		req.end();
	}
};
