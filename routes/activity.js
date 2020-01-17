'use strict';
var util = require('util');

// Deps
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
var util = require('util');
var http = require('https');

exports.logExecuteData = [];

function logData(req) {
	exports.logExecuteData.push({
		body: req.body,
		headers: req.headers,
		trailers: req.trailers,
		method: req.method,
		url: req.url,
		params: req.params,
		query: req.query,
		route: req.route,
		cookies: req.cookies,
		ip: req.ip,
		path: req.path,
		host: req.host,
		fresh: req.fresh,
		stale: req.stale,
		protocol: req.protocol,
		secure: req.secure,
		originalUrl: req.originalUrl
	});
	// console.log("body: " + util.inspect(req.body));
	// console.log("headers: " + req.headers);
	// console.log("trailers: " + req.trailers);
	// console.log("method: " + req.method);
	// console.log("url: " + req.url);
	// console.log("params: " + util.inspect(req.params));
	// console.log("query: " + util.inspect(req.query));
	// console.log("route: " + req.route);
	// console.log("cookies: " + req.cookies);
	// console.log("ip: " + req.ip);
	// console.log("path: " + req.path);
	// console.log("host: " + req.host);
	// console.log("fresh: " + req.fresh);
	// console.log("stale: " + req.stale);
	// console.log("protocol: " + req.protocol);
	// console.log("secure: " + req.secure);
	console.log("originalUrl: " + req.originalUrl);
}

/*
 * POST Handler for / route of Activity (this is the edit route).
 */
exports.edit = function (req, res) {
	// Data from the req and put it in an array accessible to the main app.
	//console.log( req.body );
	logData(req);
	res.send(200, 'Edit');
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function (req, res) {
	// Data from the req and put it in an array accessible to the main app.
	//console.log( req.body );
	logData(req);
	res.send(200, 'Save');
};

/*
 * POST Handler for /execute/ route of Activity.
 */
// exports.execute = function (req, res) {
// 	// example on how to decode JWT
// 	JWT(req.body, process.env.jwtSecret, (err, decoded) => {

// 		// verification error -> unauthorized request
// 		if (err) {
// 			console.error(err);
// 			return res.status(401).end();
// 		}

// 		if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
			
// 			// decoded in arguments
// 			var decodedArgs = decoded.inArguments[0];
// 			logData(req);
// 			res.send(200, 'Execute');
// 		} else {
// 			console.error('inArguments invalid.');
// 			return res.status(400).end();
// 		}
// 	});
// };

exports.execute = function (req, res) {
    JWT(req.body, process.env.jwtSecret, (err, decoded) => {
        if (err) {
            console.error(err);
            return res.status(401).end();
        }

        console.log('buffer hex', req.body.toString('hex'));

        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            var decodedArgs = decoded.inArguments[0];
            console.log('inArguments', JSON.stringify(decoded.inArguments));
            console.log('decodedArgs', JSON.stringify(decodedArgs));

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Key ${process.env.BLIPAUTHORIZATIONKEY}`
            }

            const phoneNumber = decodedArgs['phoneNumber'];
            const templateName = decodedArgs['templateName'];

            const guid_id = uuidv4();

            const post_save = {
                "id": guid_id,
                "to": "postmaster@wa.gw.msging.net",
                "method": "get",
                "uri": `lime://wa.gw.msging.net/accounts/+${phoneNumber}`
            }

            axios.post('https://msging.net/commands', post_save, { headers: headers }).then((res) => {
                const post_hsm = {
                    "id": guid_id,
                    "to": `${phoneNumber}@wa.gw.msging.net`,
                    "type": "application/json",
                    "content": {
                        "type": "hsm",
                        "hsm": {
                            "namespace": "0cf88f37_b88f_d3bd_b5be_f22588aabf89",
                            "element_name": templateName,
                            "fallback_lg": "pt",
                            "fallback_lc": "BR",
                            "localizable_params": []
                        }
                    }
                }

                axios.post('https://msging.net/messages', post_hsm, { headers: headers }).then((res) => {
                    console.log(`Success send whatsapp to ${phoneNumber}`);
                }).catch((err) => {
                    console.log(`ERROR send whatsapp to ${phoneNumber}: ${err}`)
                })
            }).catch((err) => {
                console.log(`ERROR verify whatsapp to ${phoneNumber}: ${err}`)
            })


            logData(req);
            res.send(200, 'Execute');
        } else {
            console.error('inArguments invalid.');
            return res.status(400).end();
        }
    });
};



/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function (req, res) {
	// Data from the req and put it in an array accessible to the main app.
    console.log( { reqBody: req.body.toString('hex') } );
    JWT(req.body, process.env.jwtSecret, (err, decoded) => {
        console.log({decoded})
    })
	logData(req);
	res.send(200, 'Publish');

};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function (req, res) {
	// Data from the req and put it in an array accessible to the main app.
	//console.log( req.body );
	logData(req);
	res.send(200, 'Validate');
};