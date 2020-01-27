/**
 * Server related task
 */

// dependencies
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const handlers = require('./handlers');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const helpers = require('./helpers');
const util = require('util');
const debug = util.debuglog('server');
// server object module
const server = {};

// instantiate http server
server.httpServer = http.createServer(function (req, res) {
    server.unifiedServer(req, res);
});

// https configuration
server.httpsServerOption = {
    'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};

// instantiate https server
server.httpsServer = https.createServer(server.httpsServerOption, function (req, res) {
    server.unifiedServer(req, res);
});

// server logic for both http and https
server.unifiedServer = function (req, res) {
    // get url, parse it
    const parsedUrl = url.parse(req.url, true);
    // get pathname from url
    const pathName = parsedUrl.pathname;
    const trimmedPath = pathName.replace(/^\/+|\/+$/g, '');

    // protocol used
    const protocol = parsedUrl.protocol;

    // get query string as an object
    const queryStringObject = parsedUrl.query;

    // get http method
    const method = req.method.toLowerCase();

    // get the headers as an object
    const headers = req.headers;

    // get the payload, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';

    // if there is payload, append buffer
    req.on('data', function (data) {
        buffer += decoder.write(data);
    });

    // when req ends
    req.on('end', function () {
        buffer += decoder.end();

        // choose the handler, if not found -> default : notFound handler
        let chosenHandler = typeof (server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        // if the request is within the public directory
        chosenHandler = trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHandler;

        // data object for handler
        const data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'protocol': protocol,
            'payload': helpers.parseStringToJsonObject(buffer)
        };

        // route the request to the handler specified in the router
        chosenHandler(data, function (statusCode, payload, contentType) {

            // determine the type of response (fallback to json)
            contentType = typeof (contentType) === 'string' ? contentType : 'json'

            // use the status code called back by the handler, or default
            statusCode = typeof (statusCode) === 'number' ? statusCode : 200;



            // convert the payload to a string
            // const payloadString = JSON.stringify(payload);

            // return the response parts that are content-specifiv
            let payloadString = '';

            // for json
            if (contentType === 'json') {
                res.setHeader('Content-Type', 'application/json');
                // use the payload called by the handler, or default
                payload = typeof (payload) === 'object' ? payload : {};
                payloadString = JSON.stringify(payload);
            }

            // for html
            if (contentType === 'html') {
                res.setHeader('Content-Type', 'text/html');
                payloadString = typeof (payload) === 'string' ? payload : '';
            }

            // for favicon
            if (contentType === 'favicon') {
                res.setHeader('Content-Type', 'image/x-icon');
                payloadString = typeof (payload) !== 'undefined' ? payload : '';
            }

            // for jpg
            if (contentType == 'jpg') {
                res.setHeader('Content-Type', 'image/jpeg');
                payloadString = typeof (payload) !== 'undefined' ? payload : '';
            }

            // for plain text
            if (contentType == 'plain') {
                res.setHeader('Content-Type', 'text/plain');
                payloadString = typeof (payload) !== 'undefined' ? payload : '';
            }

            // for js file
            if (contentType == 'js') {
                res.setHeader('Content-Type', 'text/javascript');
                payloadString = typeof (payload) !== 'undefined' ? payload : '';
            }

            // for css
            if (contentType == 'css') {
                res.setHeader('Content-Type', 'text/css');
                payloadString = typeof (payload) !== 'undefined' ? payload : '';
            }

            // for svg file
            if (contentType == 'svg') {
                res.setHeader('Content-Type', 'image/svg+xml');
                payloadString = typeof (payload) !== 'undefined' ? payload : '';
            }

            // for png
            if (contentType == 'png') {
                res.setHeader('Content-Type', 'image/png');
                payloadString = typeof (payload) !== 'undefined' ? payload : '';
            }

            // return the response-parts common to all content-types
            res.writeHead(statusCode);
            res.end(payloadString);

            // if the response is 200 print green otherwise print red
            if (statusCode == 200) {
                debug('\x1b[32m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
            } else {
                debug('\x1b[31m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
            }
        });
    });

};


// routes
// users -> create user, update user, delete user
server.router = {
    '': handlers.index,
    'session/login': handlers.sessionLogin,
    'account/create': handlers.accountCreate,
    'account/edit': handlers.accountEdit,
    'user/usercart': handlers.getUserCartStatic,
    'itemlist': handlers.itemList,
    'api/users': handlers.users,
    'api/tokens': handlers.tokens,
    'api/login': handlers.login,
    'api/menuitems': handlers.menuItems,
    'api/usercart': handlers.userCart,
    'api/createorder': handlers.createOrder,
    'api/user/cart': handlers.getUserCartDynamic,
    'favicon.ico': handlers.favicon,
    'public': handlers.public
};


// server init funciton
server.init = function () {
    // start http sevrer @port httpPort in config
    server.httpServer.listen(config.httpPort, function () {
        console.log('\x1b[36m%s\x1b[0m', 'Http Server is listening on port ' + config.httpPort + ' in ' + config.envName + ' mode.');
    });
    // start https server @port httpsPort in config 
    server.httpsServer.listen(config.httpsPort, function () {
        console.log('\x1b[35m%s\x1b[0m', 'Https Server is listening on port ' + config.httpsPort + ' in ' + config.envName + ' mode.');
    });
};

// export the server object
module.exports = server;