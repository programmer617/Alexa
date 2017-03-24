"use strict";
var APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).
var Alexa = require("alexa-sdk");
var https = require("https");
var PACE = require("./api/pace");

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(balanceHandlers, paymentHandlers, confirmationHandlers);
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
         if (options.path === "/billing/payments"){
            var theAmount = parseInt(context.event.request.intent.slots.payment.value) * 100;
            console.log('paymentAmount.value: ', theAmount);
            var obj = {
                "amount": theAmount
            };
            var postJson = JSON.stringify(obj);
            console.log('Post body: ', postJson);
            req.write(postJson);
         }
         req.end();  
};

var speechResponse = function(body){
    body = JSON.parse(body);
    console.log('Body: ', body);
    var speechOutput;

    if(this.event.request.intent.name === 'BalanceIntent'){
        speechOutput = "Your balance is $" + body.balance/100;      
        this.event.session.attributes.fullamount =  body.balance/100;
        speechOutput += " with your next payment of $" + body.amount_due/100;
        speechOutput += " due on " + body.next_payment_date;
        this.emit(":ask", speechOutput, "What would you like to do now? Say make a payment, or, i'm done");
    }
    if (this.event.request.intent.name === 'PaymentIntent') {
        speechOutput = 'Your credit card ending in <say-as interpret-as="digits">' + body.card_last4 + '</say-as>';     
        speechOutput += " has been charged $" + body.amount/100;
        speechOutput += " your new balance is $" + body.new_balance/100;
        speechOutput += " due on " + body.next_payment_date;
        this.emit(":ask", speechOutput, "What would you like to do now, say send a confirmation, or, i'm done");
    }
    if (this.event.request.intent.name === 'ConfirmationIntent') {
        speechOutput = "Confirmation email was sent to ";
        speechOutput += body.recipient;
        speechOutput += " with the subject " + body.subject;
        this.emit(":ask", speechOutput, "Can I help you with anything else, say yes, or, i'm done");
    }
};

var balanceHandlers = {
    "BalanceIntent": function(){
        if (this.event.session.user.accessToken == undefined) {
            this.emit(':tellWithLinkAccountCard', 'to start using this skill, please use the companion app to authenticate on Amazon');
            return;
        }
        callPace(PACE.getBalance(this.event.session.user.accessToken), speechResponse, this);
    }
};

var paymentHandlers = {
    "PaymentIntent": function(){
        if (this.event.session.user.accessToken == undefined) {
            this.emit(':tellWithLinkAccountCard', 'to start using this skill, please use the companion app to authenticate on Amazon');
            return;
        }
        if (this.event.request.intent.slots.payment.value == undefined) {
            this.emit(':ask', 'Please specify the amount you want to pay', 'for example one dollar or pay in full');
            return;
        }
        callPace(PACE.postPayment(this.event.session.user.accessToken), speechResponse, this);
    },

    "PayInFullIntent": function(){
        if (this.event.session.user.accessToken == undefined) {
            this.emit(':tellWithLinkAccountCard', 'to start using this skill, please use the companion app to authenticate on Amazon');
            return;
        }
        var theAmount = this.event.session.attributes.fullamount;
        this.emit(':tell', 'Amount to be paid ' + theAmount);
        console.log('attributes.fullamount: ', theAmount);
        var obj = {
            "amount": theAmount
        };
        var postJson = JSON.stringify(obj);
        console.log('Post body: ', postJson);
        this.emit(":ask", "Your payment of $" +  theAmount + " was successful, what would you like to do now", "Say send a confirmation, or, i'm done");
    }
};

var confirmationHandlers = {
    "ConfirmationIntent": function () {
        if (this.event.session.user.accessToken == undefined) {
            this.emit(':tellWithLinkAccountCard', 'to start using this skill, please use the companion app to authenticate on Amazon');
            return;
        }       
        console.log('In ConfirmationIntent');
        callPace(PACE.sendConfirmation(this.event.session.user.accessToken), speechResponse, this);
    },
    "CompletionIntent": function () {
        if (this.event.session.user.accessToken == undefined) {
            this.emit(':tellWithLinkAccountCard', 'to start using this skill, please use the companion app to authenticate on Amazon');
            return;
        }       
        console.log('In CompletionIntent');
        this.emit(":tell", "Thank you for insuring with Homesite, goodbye");
    }
};

