/**
 * A request handler
 */

// decpendencies
const helpers = require('./helpers');
const _crud = require('./crud');
const shopdata = require('./shopdata');

// handlers container
const handlers = {};

/**
 * HTML handlers
 */

//  index handler
handlers.index = function (data, callback) {
    // reject any request that is not a GET
    if (data.method == 'get') {
        // prepare data for interpolation
        const templateData = {
            'head.title': 'Get the best pizza that you like !',
            'head.description': 'Best pizza, fast delivery @ your door step!',
        };

        // read in a template as a string
        helpers.getTemplate('index', templateData, function (err, str) {
            if (!err && str) {
                // add the universal header and footer template
                helpers.addUniversalTemplates(str, templateData, function (err, str) {
                    if (!err && str) {
                        // return that page as a html
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });

    } else {
        callback(405, undefined, 'html');
    }
};

// public handler
handlers.public = function (data, callback) {
    // reject any request that is not a GET
    if (data.method === 'get') {
        // get the finename being requested
        const trimmedAssetName = data.trimmedPath.replace('public/', '').trim();
        if (trimmedAssetName.length > 0) {
            // read in the asset's data
            helpers.getStaticAsset(trimmedAssetName, function (err, data) {
                if (!err && data) {
                    // determine the content type (default to plain text)
                    let contentType = 'plain';

                    if (trimmedAssetName.indexOf('.css') > -1) {
                        contentType = 'css';
                    }

                    if (trimmedAssetName.indexOf('.js') > -1) {
                        contentType = 'js';
                    }

                    if (trimmedAssetName.indexOf('.svg') > -1) {
                        contentType = 'svg';
                    }

                    if (trimmedAssetName.indexOf('.png') > -1) {
                        contentType = 'png';
                    }

                    if (trimmedAssetName.indexOf('.jpg') > -1) {
                        contentType = 'jpg';
                    }

                    if (trimmedAssetName.indexOf('.ico') > -1) {
                        contentType = 'favicon';
                    }

                    callback(200, data, contentType);
                } else {
                    callback(404);
                }
            });
        }
    } else {
        callback(405);
    }
};

// favicon handler
handlers.favicon = function (data, callback) {
    // reject a request that is not a GET
    if (data.method == 'get') {
        // read in the favicon's data
        helpers.getStaticAsset('favicon.ico', function (err, data) {
            if (!err && data) {
                // callback the data
                callback(200, data, 'favicon');
            } else {
                callback(500);
            }
        });
    } else {
        callback(405);
    }
};

// create account handler
handlers.accountCreate = function (data, callback) {
    // reject any request that is not a GET
    if (data.method == 'get') {
        // prepare data for interpolation
        const templateData = {
            'head.title': 'Create an Account !',
            'head.description': 'Signup to get started, get your delicious pizza!',
        };

        // read in a template as a string
        helpers.getTemplate('accountCreate', templateData, function (err, str) {
            if (!err && str) {
                // add the universal header and footer template
                helpers.addUniversalTemplates(str, templateData, function (err, str) {
                    if (!err && str) {
                        // return that page as a html
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });

    } else {
        callback(405, undefined, 'html');
    }
};

// create new session handler
handlers.sessionLogin = function (data, callback) {
    // Reject any request that is not a GET
    if (data.method === 'get') {
        // prepare data for interpolation
        const templateData = {
            'head.title': 'Login to your account.',
            'head.description': 'Provide your email and password to access your account.',
        };

        // read login template as string
        helpers.getTemplate('login', templateData, function (err, str) {
            if (!err && str) {
                // add the universal header and footer template
                helpers.addUniversalTemplates(str, templateData, function (err, str) {
                    if (!err && str) {
                        // return the page as html
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

// get the items page (only allow logged in user to see the menu item or redirect to login page)
handlers.itemList = function (data, callback) {
    // reject if the request is not a GET
    if (data.method === 'get') {
        // prepare data for interpolation
        const templateData = {
            'head.title': 'Get the best pizza you like',
            'head.description': 'Get the best pizza at best price!',
        };

        // read login template as string
        helpers.getTemplate('items', templateData, function (err, str) {
            if (!err && str) {
                // add the universal header and footer template
                helpers.addUniversalTemplates(str, templateData, function (err, str) {
                    if (!err && str) {
                        // return the page as html
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

// get the user cart static template
handlers.getUserCartStatic = function (data, callback) {
    // reject any request that is not a GET
    if (data.method == 'get') {
        // prepare data for interpolation
        const templateData = {
            'head.title': 'Get the best pizza that you like !',
        };

        // read in a template as a string
        helpers.getTemplate('userCart', templateData, function (err, str) {
            if (!err && str) {
                // add the universal header and footer template
                helpers.addUniversalTemplates(str, templateData, function (err, str) {
                    if (!err && str) {
                        // return that page as a html
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });

    } else {
        callback(405, undefined, 'html');
    }
};

// get the dynamic user cart content and 
handlers.getUserCartDynamic = function (data, callback) {
    // reject if the request is not a GET
    if (data.method === 'get') {
        // make template for the user cart
        let cartItemTemplate = '';

        // get user cart details, get the items listed in the user cart with the price
        handlers.userCart(data, function (statusCode, cartData) {
            if (statusCode === 200 && cartData) {
                // create cartItemTemplate for each item in the user cart
                if (Object.keys(cartData).length > 0) {
                    for (let key in cartData) {
                        // get the item name
                        let storeItemName = Object.keys(cartData[key]);
                        // get the price
                        const price = cartData[key][storeItemName]
                        // update the item name
                        let itemName = storeItemName[0].split('_').join(' ');


                        cartItemTemplate += `
                            <div class="col-xl-3 col-lg-3 col-md-4 mb-4">
                                <div class="card">
                                    <div class="card-body">
                                        <h5 style="text-transform: capitalize;">${itemName}</h5>
                                        <p class="card-text">Rs.${price / 100}</p>
                                        <button class="btn btn-success" id="${key}">Place Order</button>
                                    </div>
                                </div>
                            </div>`;
                    }
                } else {
                    cartItemTemplate = `
                <div class="col-lg-12 mt-5 text-center">
                    <p class="h2">Your cart is empty</p>
                </div>`;
                }


                callback(200, cartItemTemplate, 'html');
            }
        });

    } else {
        callback(405, { 'error': 'Bad Request' });
    }
};

// get the account setting template handler
handlers.accountEdit = function (data, callback) {
    // reject any request that is not a GET
    if (data.method === 'get') {
        // prepare data for interpolation
        const templateData = {
            'head.title': 'Account Settings'
        };

        // read in account edit template as a string
        helpers.getTemplate('accountEdit', templateData, function (err, str) {
            if (!err && str) {
                // add the universal header and footer template
                helpers.addUniversalTemplates(str, templateData, function (err, str) {
                    if (!err && str) {
                        // return the page as html
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
}


/**
 * JSON Handlers
 */

// notFound handler
handlers.notFound = function (data, callback) {
    callback(404, { 'error': 'PAGE NOT FOUND' });
};

// user handler
handlers.users = function (data, callback) {
    // list of acceptable methods users can use
    const acceptableMethods = ['post', 'get', 'put', 'delete'];

    // validate the method
    if (acceptableMethods.indexOf(data.method) > -1) {
        // call the users sub-method
        handlers._users[data.method](data, callback);
    } else {
        callback(405, { 'error': 'Bad Request' });
    }
};
// users sub method container
handlers._users = {};

// users - post
// required data: firstName, lastName, password, phone, email, address, tosAgreement
// optional data: none
handlers._users.post = function (data, callback) {
    // check if all the required fileds are provided
    const firstName = typeof (data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof (data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const phone = typeof (data.payload.phone) === 'string' && data.payload.phone.length === 10 ? data.payload.phone : false;
    const password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 5 ? data.payload.password : false;
    const email = typeof (data.payload.email) === 'string' && helpers.validateEmailFormat(data.payload.email.trim()) ? data.payload.email.trim() : false;
    const address = typeof (data.payload.address) === 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;
    const tosAgreement = typeof (data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement === true ? data.payload.tosAgreement : false;

    if (firstName && lastName && phone && password && email && address && tosAgreement) {
        // make sure user does not already exist
        _crud.read('users', email, function (err, userData) {
            if (err) {
                // hash the user password
                const hashedPassword = helpers.hash(password);
                if (hashedPassword) {
                    // create user details object
                    const userDetails = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'password': hashedPassword,
                        'phone': phone,
                        'email': email,
                        'address': address,
                        'tosAgreement': tosAgreement,
                        'accountCreatedOn': Date.now()
                    }

                    // store the user
                    _crud.create('users', email, userDetails, function (err) {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, { 'error': 'Could not create the new user.' });
                        }
                    });

                } else {
                    callback(500, { 'error': 'Could not hash user password.' });
                }
            } else {
                callback(500, { 'error': 'A user with the same phone number already exist.' });
            }
        });

    } else {
        callback(400, { 'error': 'Missing required fields.' });
    }
};

// users - get
// required data: email
// optional data: none
// only authorised user can acess their data and not other's data
handlers._users.get = function (data, callback) {
    // check if all the require fields is provided
    const email = typeof (data.queryStringObject.email) === 'string' && helpers.validateEmailFormat(data.queryStringObject.email.trim()) ? data.queryStringObject.email.trim() : false;

    if (email) {
        // get the token from the headers
        const token = typeof (data.headers.token) === 'string' && data.headers.token.trim().length === 20 ? data.headers.token.trim() : false;

        // verify that given token is valid for the provided email
        handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
            // if valid
            if (tokenIsValid) {
                // lookup the user
                _crud.read('users', email, function (err, userData) {
                    if (!err && userData) {
                        // remove the hashedPassword from  the userData
                        delete userData.password;
                        callback(200, userData);
                    } else {
                        callback(404, { 'error': 'User does not exist.' });
                    }
                });
            } else {
                callback(403, { 'error': 'Missing required token in header or token is invalid.' });
            }
        });


    } else {
        callback(404, { 'error': 'Missing required field.' });
    }

};

// users - put
// required data: email
// optional data: firstName, lastName, phone, address, password. Atleaset one of these must be provided
// only authorised user can update their data and not other's data
handlers._users.put = function (data, callback) {
    // check if the required field is provided
    const email = typeof (data.payload.email) === 'string' && helpers.validateEmailFormat(data.payload.email.trim()) ? data.payload.email.trim() : false;
    // check optional fields
    const firstName = typeof (data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName : false;
    const lastName = typeof (data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName : false;
    const address = typeof (data.payload.address) === 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;
    const password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 5 ? data.payload.password.trim() : false;
    const phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
    if (email) {
        // error if email is provided
        if (firstName || lastName || phone || password || address) {
            // get the token from the headers
            const token = typeof (data.headers.token) === 'string' && data.headers.token.trim().length === 20 ? data.headers.token.trim() : false;
            // verify that the token is valid for the provided email
            handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
                // if valid
                if (tokenIsValid) {
                    // lookup the user
                    _crud.read('users', email, function (err, userData) {
                        if (!err) {
                            // update the field necessary
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (phone) {
                                userData.phone = phone;
                            }
                            if (address) {
                                userData.address = address;
                            }
                            if (password) {
                                userData.password = helpers.hash(password);
                            }

                            // store the new user data : update
                            _crud.update('users', email, userData, function (err) {
                                if (!err) {
                                    callback(200);
                                } else {
                                    callback(500, { 'error': 'Could not update the user' });
                                }
                            });
                        } else {
                            callback(400, { 'error': 'Specified user does not exist.' });
                        }
                    });
                } else {
                    callback(403, { 'error': 'Missing required token in header or token is invalid.' });
                }
            });

        }
    } else {
        callback(400, { 'error': 'Missing required field.' });
    }

};

// users - delete
// required data: email
// only authorised user can delte their account only.
// cleanup user cart data if user is deleted
handlers._users.delete = function (data, callback) {
    // check the required field
    const email = typeof (data.queryStringObject.email) === 'string' && helpers.validateEmailFormat(data.queryStringObject.email.trim()) ? data.queryStringObject.email.trim() : false;

    if (email) {
        // get the token from the headers
        const token = typeof (data.headers.token) === 'string' && data.headers.token.trim().length === 20 ? data.headers.token.trim() : false;

        // verify that token is valid for the povided email
        handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
            // if valid
            if (tokenIsValid) {
                // lookup user
                _crud.read('users', email, function (err, userData) {
                    if (!err && userData) {
                        // delete the user
                        _crud.delete('users', email, function (err) {
                            if (!err) {
                                // delete the user cart details
                                shopdata.removeUserCart(email, function (status, err) {
                                    if (!err) {
                                        callback(status);
                                    } else {
                                        callback(status, { 'error': err });
                                    }
                                })
                            } else {
                                callback(500, { 'error': 'Could not delete the specified user.' });
                            }
                        });
                    } else {
                        callback(400, { 'error': 'Could not find the specified user.' });
                    }
                });
            } else {
                callback(403, { 'error': 'Missing required token in header or token is invalid.' });
            }
        });

    } else {
        callback(400, { 'error': 'Missing required field.' });
    }

};

// tokens handler
handlers.tokens = function (data, callback) {
    // acceptable methods for tokens
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (typeof (data.method) === 'string' && acceptableMethods.indexOf(data.method) > -1) {
        // call the tokens sub-method
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405, { 'error': 'Bad request.' });
    }
};

// tokens sub-method container
handlers._tokens = {};

// tokens - post
// required data: email, password
// option data : none
handlers._tokens.post = function (data, callback) {
    // check if required fields are provided
    const email = typeof (data.payload.email) === 'string' && helpers.validateEmailFormat(data.payload.email.trim()) ? data.payload.email.trim() : false;
    const password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 5 ? data.payload.password.trim() : false;
    // if valid
    if (email && password) {
        // lookup user who matches the email
        _crud.read('users', email, function (err, userData) {
            if (!err && userData) {
                // check the password sent with the actual password of the user
                const hashedPassword = helpers.hash(password);
                // if valid
                if (hashedPassword === userData.password) {
                    // create a new token with a random name. Set expiration date 5 hours in the future
                    const tokenID = helpers.createRandomString(20);
                    const expires = Date.now() + 1000 * 60 * 60 * 5;
                    // if tokenID created
                    if (tokenID) {
                        const tokenObject = {
                            'id': tokenID,
                            'expires': expires,
                            'email': email
                        };

                        // store the token
                        _crud.create('tokens', tokenID, tokenObject, function (err) {
                            if (!err) {
                                callback(200, tokenObject);
                            } else {
                                callback(500, { 'error': 'Could not new create token.' });
                            }
                        });

                    } else {
                        callback(500, { 'error': 'Could not create token id.' });
                    }
                } else {
                    callback(400, { 'error': 'Incorrect password.' });
                }
            } else {
                callback(400, { 'error': 'Could not find the specified user.' });
            }
        });
    } else {
        callback(400, { 'error': 'Missing required fields.' });
    }

};

// tokens - get
// required data: id
// optional data: none
handlers._tokens.get = function (data, callback) {
    // check if the required field is provided
    const id = typeof (data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;
    // if valid
    if (id) {
        // lookup token
        _crud.read('tokens', id, function (err, tokenData) {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404, { 'error': 'Token does not exist' });
            }
        });
    } else {
        callback(400, { 'error': 'Missing required field.' });
    }
};

// tokens - put
// required data: id, extend
// optional data: none
handlers._tokens.put = function (data, callback) {
    const id = typeof (data.payload.id) === 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false;
    const extend = typeof (data.payload.extend) === 'boolean' && data.payload.extend === true ? true : false;

    // if valid
    if (id && extend) {
        // lookup token
        _crud.read('tokens', id, function (err, tokenData) {
            if (!err && tokenData) {
                // check to make sure token is not already expired
                if (tokenData.expires > Date.now()) {
                    // set the expiration 5 hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60 * 5;

                    // update the token with new expires
                    _crud.update('tokens', id, tokenData, function (err) {
                        if (!err) {
                            callback(200, tokenData);
                        } else {
                            callback(500, { 'error': 'Could not update specified token\'s expiration.' });
                        }
                    });
                } else {
                    callback(400, { 'error': 'Token has already expired, cannot be extended.' });
                }
            } else {
                callback(400, { 'error': 'Specified token does not exist.' });
            }
        });
    } else {
        callback(400, { 'error': ' Missing required fields.' });
    }

};

// tokens - delete
// required data: id
// optional data: none
handlers._tokens.delete = function (data, callback) {
    // check if required field is provided
    const id = typeof (data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;
    // if valid
    if (id) {
        // lookup token
        _crud.read('tokens', id, function (err, tokenData) {
            if (!err && tokenData) {
                // delete the token
                _crud.delete('tokens', id, function (err) {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, { 'error': 'Could not delete the specified token.' });
                    }
                });
            } else {
                callback(400, { 'error': 'Could not find the specified token.' });
            }
        });

    } else {
        callback(400, { 'error': 'Missing required field.' });
    }
};

// token - verify
// verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = function (id, email, callback) {
    // lookup token
    _crud.read('tokens', id, function (err, tokenData) {
        if (!err && tokenData) {
            // check if the token is for given user and has not expired
            if (tokenData.email === email && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

// login handler
// required data: email, password
// optional data: none
handlers.login = function (data, callback) {
    // check if required field is provided
    const email = typeof (data.payload.email) === 'string' && helpers.validateEmailFormat(data.payload.email.trim()) ? data.payload.email.trim() : false;
    const password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 5 ? data.payload.password.trim() : false;

    if (email && password) {
        // accpet only for valid method: post
        if (typeof (data.method) === 'string' && data.method === 'post') {
            // get the token from the headers
            const token = typeof (data.headers.token) === 'string' && data.headers.token.trim().length === 20 ? data.headers.token : false;
            // if token is not provided in header, then create new token for the user
            if (!token) {
                handlers._tokens.post(data, callback);
            } else {
                // check if the token is valid for the specified email
                handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
                    if (tokenIsValid) {
                        // if token already exist in the header , then extend the expires of token only if not already expired
                        // set the id property: token (from headers)
                        data.payload.id = token;
                        // set extend property: true in payload to expend it. 
                        data.payload.extend = true;
                        handlers._tokens.put(data, callback);
                    } else {
                        callback(403, { 'error': 'Missing required token in header or token is invalid.' });
                    }
                });
            }
        } else {
            callback(405, { 'error': 'Bad request.' });
        }
    } else {
        callback(400, { 'error': 'Missing required field' });
    }
};


// menuitems handler
handlers.menuItems = function (data, callback) {
    // list of acceptable methods
    const acceptableMethods = ['get']
    // validate the method
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._menuItems[data.method](data, callback);
    } else {
        callback(405, { 'error': 'Bad request.' });
    }
};

// menuitems sub-methods container
handlers._menuItems = {};

// menuItems - get
// only logged in user can get all the possible menu items 
// required data: token (in headers), email
// optional data: none
handlers._menuItems.get = function (data, callback) {
    // check if the required field is provided
    const token = typeof (data.headers.token) === 'string' && data.headers.token.trim().length === 20 ? data.headers.token.trim() : false;
    const email = typeof (data.queryStringObject.email) === 'string' && helpers.validateEmailFormat(data.queryStringObject.email.trim()) ? data.queryStringObject.email.trim() : false;
    // if token and email provided
    if (token && email) {
        // verify token is valid for the provided email
        handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
            // if valid
            if (tokenIsValid) {
                shopdata.listWithPrice(function (shopItemData) {
                    if (shopItemData) {
                        callback(200, shopItemData);
                    } else {
                        callback(500, { 'error': 'Could not get the shopping menu items.' });
                    }
                });
            } else {
                callback(403, { 'error': 'Missing required token in header or token is invalid.' });
            }
        });
    } else {
        callback(400, { 'error': 'Missing required fields.' });
    }
};

// usercart handler
handlers.userCart = function (data, callback) {
    // list of acceptable methods
    const acceptableMethods = ['post', 'get'];
    // validate the method
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._userCart[data.method](data, callback);
    } else {
        callback(405, { 'error': 'Bad request.' });
    }

};

// userCart submeths container
handlers._userCart = {};

// userCart - post
// only logged in user can fill their shoping cart with items
// required data: email, item selected by the user from the available items.
// optional data: none
handlers._userCart.post = function (data, callback) {
    // check if the required data is provided
    const email = typeof (data.payload.email) === 'string' && helpers.validateEmailFormat(data.payload.email.trim()) ? data.payload.email.trim() : false;
    const item = typeof (data.payload.item) === 'string' && data.payload.item.trim().length > 0 ? data.payload.item.trim() : false;
    // if email valid
    if (email && item) {
        // get the token from the headers
        const token = typeof (data.headers.token) === 'string' && data.headers.token.trim().length === 20 ? data.headers.token.trim() : false;
        // verify if the token is valid for the provided email
        handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
            // if valid
            if (tokenIsValid) {
                shopdata.addToCart(item, email, function (status, itemsAddedToCart) {
                    // if items added to cart
                    if (itemsAddedToCart) {
                        callback(status);
                    } else {
                        callback(status, { 'error': 'One of the item in the shopping cart is not available.' });
                    }
                });
            } else {
                callback(403, { 'error': 'Missing required token in header or token is invalid.' });
            }
        });
    } else {
        callback(400, { 'error': 'Missing required field.' });
    }
}

// userCart - get
// only logged in user can get all the items from their cart.
// required data: token (in headers), email
// optional data: none
handlers._userCart.get = function (data, callback) {
    // check if the required field is provided
    const token = typeof (data.headers.token) === 'string' && data.headers.token.trim().length === 20 ? data.headers.token.trim() : false;
    const email = typeof (data.queryStringObject.email) === 'string' && helpers.validateEmailFormat(data.queryStringObject.email.trim()) ? data.queryStringObject.email.trim() : false;
    // if token and email provided
    if (token && email) {
        // verify token is valid for the provided email
        handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
            // if valid
            if (tokenIsValid) {
                shopdata.listUserCartItems(email, function (shopItemData) {
                    if (shopItemData) {
                        callback(200, shopItemData);
                    } else {
                        callback(500, { 'error': 'Could not get the user cart items.' });
                    }
                });
            } else {
                callback(403, { 'error': 'Missing required token in header or token is invalid.' });
            }
        });
    } else {
        callback(400, { 'error': 'Missing required fields.' });
    }
};


// createOrder hanler
handlers.createOrder = function (data, callback) {
    // process for oly only valid method
    if (data.method === 'post') {
        handlers._createOrder[data.method](data, callback);
    } else {
        callback(405, { 'error': 'Bad request' });
    }
};

// createOrder sub method container
handlers._createOrder = {};

// createOrder - post
// only authorised user can create order (token required in headers)
// required data: item from the user cart (cartItemid: length 5), email
// optional data: none
// remove the item from cart once order is placed
handlers._createOrder.post = function (data, callback) {
    // check if the required field is provided
    const email = typeof (data.payload.email) === 'string' && helpers.validateEmailFormat(data.payload.email.trim()) ? data.payload.email.trim() : false;

    // this id will be used as a key to access item from the user cart, and remove it from the cart when order is made successfully
    const cartItemId = typeof (data.payload.cartItemId) === 'string' && data.payload.cartItemId.length === 5 ? data.payload.cartItemId : false;

    // if required field provided
    if (email && cartItemId) {
        // get token from headers
        const token = typeof (data.headers.token) === 'string' && data.headers.token.trim().length === 20 ? data.headers.token.trim() : false;

        // check if the token is valid for the provided email
        handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
            // if token valid
            if (tokenIsValid) {
                // get the user phone and address details
                _crud.read('users', email, function (err, userData) {
                    if (!err && userData) {
                        const phone = userData.phone
                        const address = userData.address
                        // lookup items avaliable in the server to get their price
                        _crud.read('shoppingItems', 'items', function (err, itemsData) {
                            if (!err && itemsData) {
                                // lookup user cart
                                _crud.read('shoppingCart', email, function (err, cartData) {
                                    if (!err && cartData) {
                                        // get the price of the selected item price
                                        let cartItem = Object.keys(cartData.items[cartItemId]);
                                        const amount = itemsData[cartItem[0]];
                                        // upper case the items name and remove "_"
                                        cartItem = cartItem[0].split('_').join(' ').toUpperCase();
                                        // charge the amount to the user
                                        helpers.charge(amount, email, function (err) {
                                            if (!err) {
                                                // payment successfull make order
                                                const orderID = helpers.createRandomString(20);
                                                // order details object
                                                const orderDetails = {
                                                    'orderID': orderID,
                                                    'orderBy': email,
                                                    'itemName': cartItem,
                                                    'amount': amount,
                                                    'orderTime': Date.now(),
                                                    'contactNumber': phone,
                                                    'deliveryAddress': address
                                                };
                                                // store the order details (.data/userOrders/)
                                                _crud.create('userOrders', orderID, orderDetails, function (err) {
                                                    if (!err) {
                                                        // order successful, send email to the user to notify them about the oder details
                                                        // message to send 
                                                        const msg = 'Your order for ' + cartItem + ' has been placed.\nOrderID: ' + orderID + '\nAmount: Rs.' + (amount / 100) + '\nThank you.';

                                                        helpers.sendMailToUser('Pizza>> Order Placed', msg, email, function (err) {
                                                            if (!err) {
                                                                // remove item from the cart
                                                                shopdata.removeFromCart(cartItemId, email, function (status, removedFromCart) {
                                                                    if (removedFromCart) {
                                                                        callback(status);
                                                                    } else {
                                                                        callback(status, { 'error': 'Could not update the user cart' });
                                                                    }
                                                                });
                                                            } else {
                                                                callback(500, { 'error': err + '. User email may be invalid.' });
                                                            }
                                                        });

                                                    } else {
                                                        callback(500, { 'error': 'Could not create order.' });
                                                    }
                                                });
                                            } else {
                                                callback(500, { 'error': err });
                                            }
                                        });
                                    } else {
                                        callback(400, { 'error': 'Could not find the user cart details for the provided user.' });
                                    }
                                });
                            } else {
                                callback(500, { 'error': 'Could not retrive item price from the list of items.' });
                            }
                        });
                    } else {
                        callback(500, { 'error': 'Could not create order. Please try again.' });
                    }
                });

            } else {
                callback(403, { 'error': 'Missing required token in the header or token is invalid.' });
            }
        });
    } else {
        callback(400, { 'error': 'Missing required fields or invalid cart-item id.' });
    }
};

// export handler
module.exports = handlers;