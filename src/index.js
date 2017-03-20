"use strict";
var APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).
var Alexa = require("alexa-sdk");
var https = require("https");
var PACE = require("./api/pace");

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
	alexa.registerHandlers(balanceHandlers, paymentHandlers);
    alexa.execute();
};

var callPace = function(options, callback, context){
			 const req = https.request(options, (res) => {
		 	let body = '';
		 	console.log('Status:', res.statusCode);
			console.log('Headers:', JSON.stringify(res.headers));
		 	res.setEncoding('utf8');
		 	res.on('data', (chunk) => body += chunk);
		 	res.on('end', () => {
		 		console.log('Successfully processed HTTPS response');
		 		// If we know it's JSON, parse it
		 		if (res.headers['content-type'] === 'application/json') {
		 			callback.call(context, body); 
		 		}
		 	});
		 });
		 req.end();	 
};

var speechResponse = function(body){
	body = JSON.parse(body);
	console.log('Body: ', body);
 	//add specific speech response here by querying the object body that comes back
 	//not particularly a good way of figuring out what speech to create but maybe good enough for the demo
	if(body.hasOwnProperty('amount_due')){
		var speechOutput = "Your balance is $" + body.balance/100;		
		speechOutput += " with your next payment of $" + body.amount_due/100;
		speechOutput += " due on " + body.next_payment_date;
		this.emit(":tell", speechOutput);
	}
};

var balanceHandlers = {
    "BalanceIntent": function(){
		// Call Pace Billing
		callPace(PACE.getBalance(), speechResponse, this);
	}
};

var paymentHandlers = {
    "BalanceIntent": function(){
		// Call Pace Payment
		const req = https.request(PACE.postPayment(), (res) => {
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
					var speechOutput = "Your credit card ending in " + body.card_last4;		
					speechOutput += " has been charged $" + body.amount/100;
					speechOutput += " your new balance is $" + body.new_balance/100;
					speechOutput += " due on " + body.next_payment_date;
					this.emit(":tell",speechOutput);
				}
			});
		});
		req.write('{"amount": "1"}')
		req.end();
	}
};