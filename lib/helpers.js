/**
 * Helpers for various task
 */

// dependecies
const crypto = require('crypto');
const config = require('./config');
const querString = require('querystring');
const https = require('https');
const path = require('path');
const fs = require('fs');

// container for the helpers
const helpers = {};

// parse a json string to object in all case without a throw
helpers.parseStringToJsonObject = function (str) {
    try {
        const obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {};
    }
};

// validate the email format
helpers.validateEmailFormat = function (mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
        return true;
    }
    return false;
};

// create sha256 hash of string data
helpers.hash = function (str) {
    if (typeof (str) === 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash
    } else {
        return false;
    }
};

// create random alpha-numeric string of a given length
helpers.createRandomString = function (length) {
    length = typeof (length) === 'number' && length > 0 ? length : false;
    if (length) {
        // possible characters that could go into the string
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

        // start final string
        let strToReturn = '';

        for (let i = 0; i < length; ++i) {
            // get a random character from the possibleCharacters
            const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            // append the string to return
            strToReturn += randomCharacter;
        }
        return strToReturn;
    } else {
        return false;
    }
};

// create stripe charge
// required data: price, currency
helpers.charge = function (amount, email, callback) {

    // validate the required data
    amount = typeof (amount) === 'number' && amount > 0 ? amount : false;

    if (amount) {
        // configure request payload
        const payload = {
            'amount': amount,
            'currency': 'inr',
            'source': 'tok_visa',
            'description': 'Charge for ' + email
        };

        // stringify the payload
        const stringPayload = querString.stringify(payload);

        // configure the request details
        const requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.stripe.com',
            'method': 'POST',
            'path': '/v1/charges',
            'auth': config.stripe.authKey,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        };

        // instantiate the request object
        const req = https.request(requestDetails, function (res) {
            const status = res.statusCode;
            // callback successfully if the request went though
            if (status === 200 || status === 201) {
                callback(false);
            } else {
                callback('Payment unsuccessful (status: ' + status + ')');
            }
        });

        // bind the error event
        req.on('error', function (e) {
            callback(e);
        });

        // add the payload
        req.write(stringPayload);

        // end the request
        req.end();
    } else {
        callback('Given parameters were missig or invalid');
    }

};

// send email to the user with the provided msg
helpers.sendMailToUser = function (subject, msg, email, callback) {
    // validate msg
    msg = typeof (msg) === 'string' && msg.trim().length > 0 ? msg : false;
    subject = typeof (subject) === 'string' && subject.trim().length > 0 ? subject : false;

    // if valid
    if (msg && subject && email) {
        // configure request payload
        const payload = {
            'from': 'Mailgun Sandbox <postmaster@sandboxf027a6737a4746bca1d5499c4c7146d8.mailgun.org>',
            'to': email,
            'subject': subject,
            'text': msg
        };

        // stringify payload
        const stringPayload = querString.stringify(payload);


        // configure the request details
        const requestDetails = {
            'protocol': 'https:',
            'method': 'POST',
            'hostname': 'api.mailgun.net',
            'path': '/v3/' + config.mailgun.domain + '/messages',
            'auth': config.mailgun.authKey,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload),
            }
        };

        // instantiate request object
        const req = https.request(requestDetails, function (res) {
            // get the status of the request
            const status = res.statusCode;
            if (status === 200 || status === 201) {
                callback(false);
            } else {
                callback('Could not sent mail to the user (status:' + status + ').');
            }
        });

        // bind to error event
        req.on('error', function (e) {
            callback(e);
        })

        // add the payload
        req.write(stringPayload);

        // end the request
        req.end();
    } else {
        callback('Given parameters were missing or invalid');
    }
};

// get the string content of a template, and use provided data for string interpolation
helpers.getTemplate = function (templateName, data, callback) {
    templateName = typeof (templateName) === 'string' && templateName.length > 0 ? templateName : false;
    data = typeof (data) === 'object' && data !== null ? data : {};

    if (templateName) {
        const templateDir = path.join(__dirname, '/../templates/');
        fs.readFile(templateDir + templateName + '.htm', 'utf8', function (err, str) {
            if (!err && str && str.length > 0) {
                // do interpolation on the string
                const finalString = helpers.interpolate(str, data);
                callback(false, finalString);
            } else {
                callback('No template could be found.');
            }
        });
    } else {
        callback('A valid template name was not specified');
    }
};

// add the universal header and footer to a string
helpers.addUniversalTemplates = function (str, data, callback) {
    str = typeof (str) === 'string' && str.length > 0 ? str : '';
    data = typeof (data) === 'object' && data !== null ? data : {};

    // get the header template
    helpers.getTemplate('_header', data, function (err, headerStr) {
        if (!err && headerStr) {
            // get the footer
            helpers.getTemplate('_footer', data, function (err, footerStr) {
                if (!err && footerStr) {
                    // add them all together
                    const finalString = headerStr + str + footerStr;
                    callback(false, finalString);
                } else {
                    callback('Could not found the footer template.');
                }
            });
        } else {
            callback('Could not found the header template.');
        }
    });
};

// take a given string and data object, and find/replace all the keys within it
helpers.interpolate = function (str, data) {
    str = typeof (str) === 'string' && str.length > 0 ? str : '';
    data = typeof (data) === 'object' && data !== null ? data : {};

    // add the templateGlobals to the data object, prepending their key name with 'global.'
    for (let keyName in config.templateGlobals) {
        if (config.templateGlobals.hasOwnProperty(keyName)) {
            data['global.' + keyName] = config.templateGlobals[keyName];
        }
    }

    // for each key in the data object, insert its value into the string at the corresponding place
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            const find = '{' + key + '}';
            const replace = data[key];
            str = str.replace(find, replace);
        }
    }
    return str;
};

// get the contents of a static asset
helpers.getStaticAsset = function (fileName, callback) {
    fileName = typeof (fileName) === 'string' && fileName.length > 0 ? fileName : false;
    if (fileName) {
        const publicDir = path.join(__dirname, '/../public/');
        fs.readFile(publicDir + fileName, function (err, data) {
            if (!err && data) {
                callback(false, data);
            } else {
                callback('No file could be found.');
            }
        });
    } else {
        callback('A valid file name was not specified.');
    }
}

//export the module
module.exports = helpers;