'use strict';

const https = require('https');

/*
{
  "options": {
    "hostname": "musicbrainz.org",
    "port": 443,
    "path": "/ws/2/artist/5b11f4ce-a62d-471e-81fc-a69a8278c7da?inc=aliases&fmt=json",
    "method": "GET",
    "headers": {
      "User-Agent": "MyLambda/1.0.0 ( steve@ibm.com )"
    }
  }
}
*/
/**
 * Pass the data to send as `event.data`, and the request options as
 * `event.options`. For more information see the HTTPS module documentation
 * at https://nodejs.org/api/https.html.
 *
 * Will succeed with the response body.
 */
exports.handler = (event, context, callback) => {
    const req = https.request(event.options, (res) => {
        let body = '';
        console.log('Status:', res.statusCode);
        console.log('Headers:', JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            console.log('Successfully processed HTTPS response');
            // If we know it's JSON, parse it
            if (res.headers['content-type'] === 'application/json; charset=utf-8') {
                body = JSON.parse(body);
            }
            callback(null, body);
        });
    });
    req.on('error', callback);
    //req.write(JSON.stringify(event.data));
    req.end();
};
