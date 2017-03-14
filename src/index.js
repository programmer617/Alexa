"use strict";
var APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).

var BillingApiInfo = 
{
  "options": {
    "hostname": "paceapi.homesitep2.com",
    "port": 443,
    "path": "/billing",
    "method": "GET",
    "headers": {
      "User-Agent": "MyLambda/1.0.0 ( steve@ibm.com )",
      "Authorization": "Bearer 5fcef407807365c684f0bdefb9819d3c"
    }
  }
} 

var Alexa = require("alexa-sdk");
var https = require("https");

var APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
	alexa.registerHandlers(balanceHandlers);
    alexa.execute();
};

var balanceHandlers = {
    "BalanceIntent":function(){
		// Call Pace Billing
		const req = https.request(BillingApiInfo.options, (res) => {
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
