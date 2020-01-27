/**
 * Frontend logic for application
 */

//  container for frontend application
const app = {};

// config
app.config = {
    'sessionToken': false
};

// AJAX client (for RESTful API)
app.client = {};


// interface for making API call
app.client.request = function (headers, path, method, queryStringObject, payload, callback) {
    // set defaults
    headers = typeof (headers) === 'object' && headers !== null ? headers : {};
    path = typeof (path) === 'string' ? path : '/';
    method = typeof (method) === 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET';
    queryStringObject = typeof (queryStringObject) === 'object' && queryStringObject !== null ? queryStringObject : {};
    payload = typeof (payload) === 'object' && payload !== null ? payload : {};
    callback = typeof (callback) === 'function' ? callback : false;


    // for each query string parameter sent, add it to the path
    let requestUrl = path + '?';
    let counter = 0;

    for (let queryKey in queryStringObject) {
        if (queryStringObject.hasOwnProperty(queryKey)) {
            counter++;
            // if at least one query string paramenter has been added, prepend new onee with an '&' ampersand
            if (counter > 1) {
                requestUrl += '&';
            }

            // add the key and value
            requestUrl += queryKey + '=' + queryStringObject[queryKey];
        }
    }

    // form the http request as a JSON type
    const xhr = new XMLHttpRequest();
    xhr.open(method, requestUrl, true);
    xhr.setRequestHeader('Content-Type', 'applicaiton/json');

    // for each header sent, add it to the request
    for (let headerKey in headers) {
        if (headers.hasOwnProperty(headerKey)) {
            xhr.setRequestHeader(headerKey, headers[headerKey]);
        }
    }

    // if there is a current session token set, add that as a header
    if (app.config.sessionToken) {
        xhr.setRequestHeader('token', app.config.sessionToken.id);
    }

    // when a request comes back, handle the response
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            const statusCode = xhr.status;
            const responseReturned = xhr.responseText;

            // callback if requested
            if (callback) {
                try {
                    const parsedResponse = JSON.parse(responseReturned);
                    callback(statusCode, parsedResponse);
                } catch (e) {
                    callback(statusCode, false, responseReturned);
                }
            }
        }
    };

    const payloadString = JSON.stringify(payload);

    xhr.send(payloadString);

};

// bind the form
app.bindForms = function () {
    if (document.querySelector('form')) {
        const allForms = document.querySelectorAll('form');

        for (let i = 0; i < allForms.length; ++i) {
            allForms[i].addEventListener('submit', function (e) {

                // stop it from submitting
                e.preventDefault();

                const formID = this.id;
                const path = this.action;
                let method = this.method.toUpperCase()

                // hide the error (if it is currently shown due to a previous error)
                if (document.querySelector('#' + formID + ' .formError')) {
                    document.querySelector('#' + formID + ' .formError').style.display = 'none';
                }

                // hide the success message (if it is currently shown due to previous action)
                if (document.querySelector('#' + formID + ' .formSuccess')) {
                    document.querySelector('#' + formID + ' .formSuccess').style.display = 'none';
                }

                // turn the inputs into a payload
                const payload = {};
                const elements = this.elements;

                for (let i = 0; i < elements.length; ++i) {
                    if (elements[i].type !== 'submit') {
                        //set value accordingly
                        const valueOfElement = elements[i].type === 'checkbox' ? elements[i].checked : elements[i].value;
                        // get the name of the element
                        const nameOfElement = elements[i].name;

                        payload[nameOfElement] = valueOfElement;
                        if (nameOfElement === '_method') {
                            method = valueOfElement;
                        }
                    }
                }
                // if the method is DELETE, the payload should be a queryStringObject insted
                const queryStringObject = method === 'DELETE' ? payload : {};

                // call the api
                app.client.request(undefined, path, method, queryStringObject, payload, function (statusCode, responsePayload) {
                    // display an error on the form if needed
                    if (statusCode !== 200) {
                        if (statusCode === 403) {
                            // log the user out
                            app.logUserOut();
                        } else {
                            // try to get the error from the api, or set default error message
                            const error = typeof (responsePayload.error) === 'string' ? responsePayload.error : 'An error has occured, please try again.';

                            // set the formError field with the error text
                            document.querySelector('#' + formID + ' .formError').innerHTML = error;

                            // show the form error field on the form
                            document.querySelector('#' + formID + ' .formError').style.display = 'block';

                        }
                    } else {
                        // if successful, send to form response processor
                        app.formResponseProcessor(formID, payload, responsePayload);
                    }
                });

            });
        }

    }
};

// form response processor
app.formResponseProcessor = function (formId, requestPayload, responsePayload) {
    // if account creation was successful, try to immediately log in the user in
    if (formId === 'accountCreate') {
        // take the email and password, and use it to log the user in
        const newPayload = {
            'email': requestPayload.email,
            'password': requestPayload.password
        };

        app.client.request(undefined, 'api/login', 'POST', undefined, newPayload, function (newStatusCode, newResponsePayload) {
            // display an error on the form if needed
            if (newStatusCode !== 200) {
                // set the formError field with the error text
                document.querySelector('#' + formId + ' .formError').innerHTML = newResponsePayload.error;
                // show the form error field on the form
                document.querySelector('#' + formId + ' .formError').style.display = 'block';

            } else {
                // if successful, set the token and redirect the user
                app.setSessionToken(newResponsePayload, true);
            }
        });
    }

    // if login successful, set the token in local storage
    if (formId === 'login') {
        app.setSessionToken(responsePayload, true);
    }

    // if form saved successfully and they have success messages, show them
    const formWithSuccessMessages = ['accountEdit1', 'accountEdit2', 'accountEdit3'];
    if (formWithSuccessMessages.indexOf(formId) > -1) {
        document.querySelector('#' + formId + ' .formSuccess').style.display = 'block';
    }


    // response for user delete
    if (formId === 'accountEdit3') {
        window.alert('User Deleted.');
        // log out the user
        app.logUserOut();
    }


    // reset the password field after update
    if (formId === 'accountEdit2') {
        document.getElementById('accountEdit2').reset();
    }
};

// set the session token in the app.config object as well as localstorage
app.setSessionToken = function (token, redirect) {
    app.config.sessionToken = token;
    const tokenString = JSON.stringify(token);
    localStorage.setItem('token', tokenString);
    if (redirect) {
        window.location = '/itemlist';
    }
};

// get the session token from the local storage and set it in the app.config object
app.getSessionToken = function () {
    const tokenString = localStorage.getItem('token');
    if (typeof (tokenString) === 'string') {
        try {
            const token = JSON.parse(tokenString);
            app.config.sessionToken = token;
            app.triggerSetLoggedInClass(token);
        } catch (e) {
            app.config.sessionToken = false;
        }
    } else {
        localStorage.setItem('token', false);
        app.triggerSetLoggedInClass(false);
    }
};

// trigger set logged in class
app.triggerSetLoggedInClass = function (token) {
    if (typeof (token) == 'object') {
        app.setLoggedInClass(true);
    } else {
        app.setLoggedInClass(false);
    }
};

// set/ remove loggedIn/loggedOut class
app.setLoggedInClass = function (setIt) {
    if (setIt) {
        document.querySelector('#LoginLi').style.display = 'none';
        document.querySelector('#SignupLi').style.display = 'none';
        document.querySelector('#LogoutLi').style.display = 'block';
        document.querySelector('#MyCartLi').style.display = 'block';
        document.querySelector('#AccountLi').style.display = 'block';

    } else {
        document.querySelector('#LoginLi').style.display = 'block';
        document.querySelector('#SignupLi').style.display = 'block';
        document.querySelector('#LogoutLi').style.display = 'none';
        document.querySelector('#MyCartLi').style.display = 'none';
        document.querySelector('#AccountLi').style.display = 'none';

    }
};

// renew the token
app.renewToken = function (callback) {
    const currentToken = typeof (app.config.sessionToken) === 'object' ? app.config.sessionToken : false;

    if (currentToken) {
        // update the token with a new expiration
        const payload = {
            'id': currentToken.id,
            'extend': true
        };
        app.client.request(undefined, 'api/tokens', 'PUT', undefined, payload, function (statusCode, responsePayload) {
            if (statusCode === 200) {
                // get the new token details
                const queryStringObject = { 'id': currentToken.id };
                app.client.request(undefined, 'api/tokens', 'GET', queryStringObject, undefined, function (statusCode, responsePayload) {
                    if (statusCode === 200) {
                        app.setSessionToken(responsePayload);
                        callback(false);
                    } else {
                        app.setSessionToken(false);
                        callback(true);
                    }
                });
            } else {
                app.setSessionToken(false);
                callback(true);
            }
        });
    } else {
        app.setSessionToken(false);
        callback(true);
    }
};

// loop to renew the token
app.tokenRenewalLoop = function () {
    setInterval(function () {
        app.renewToken(function (err) {
            if (!err) {
                console.log('Token renewed successfully @' + Date.now());
            }
        });
    }, 60 * 1000);
};

// bind logout button
app.bindLogoutButton = function () {
    document.getElementById('logoutButton').addEventListener('click', function (e) {
        // prevent default
        e.preventDefault();

        // log out the user
        app.logUserOut();
    });
}

// bind item list button
app.bindItemList = function () {
    if (document.getElementById('items')) {
        document.getElementById('items').addEventListener('click', function (e) {
            const queryStringObject = {
                'email': app.config.sessionToken.email
            };
            app.client.request(undefined, '/api/menuitems', 'GET', queryStringObject, undefined, function (statusCode, responsePayload) {
                if (statusCode !== 200) {
                    if (statusCode === 403) {
                        // log the user out
                        app.logUserOut();
                    }
                    // if token does not exist
                    if (!app.config.sessionToken) {
                        window.location = '/session/login';
                    } else {
                        window.alert(responsePayload.error);
                    }
                } else {
                    window.location = '/itemlist';
                }
            });

        });
    }
}

// bind item list button in navbar
app.bindItemListInNav = function () {
    if (document.getElementById('navItems')) {
        document.getElementById('navItems').addEventListener('click', function (e) {
            // prevent default
            e.preventDefault();

            const queryStringObject = {
                'email': app.config.sessionToken.email
            };
            app.client.request(undefined, '/api/menuitems', 'GET', queryStringObject, undefined, function (statusCode, responsePayload) {
                if (statusCode !== 200) {
                    if (statusCode === 403) {
                        // log the user out
                        app.logUserOut();
                    }
                    // if token does not exist
                    if (!app.config.sessionToken) {
                        window.location = '/session/login';
                    } else {
                        window.alert(responsePayload.error);
                    }
                } else {
                    window.location = '/itemlist';
                }
            });

        });
    }
}

// bind items container
app.bindItemsContainer = function () {
    if (document.getElementById('itemsContainer')) {
        const container = document.getElementById('itemsContainer');
        const children = (container.children)
        for (let i = 0; i < children.length; ++i) {
            children[i].addEventListener('click', function (e) {
                // get the id and add it to the payload
                const payload = {
                    'email': app.config.sessionToken.email,
                    'item': children[i].id
                }
                // make request to add it to the user cart
                app.client.request(undefined, '/api/usercart', 'POST', undefined, payload, function (statusCode, responsePayload) {
                    if (statusCode !== 200) {
                        if (statusCode === 403) {
                            // log out the user
                            app.logUserOut();
                        } else {
                            window.alert(responsePayload.error);
                        }
                    } else {
                        window.alert('Item added to your cart.');
                    }
                })
            });
        }
    }
}

// bind user cart button
app.addCartItemsToCartContainer = function () {
    if (document.getElementById('cartContainer')) {
        const queryStringObject = {
            'email': app.config.sessionToken.email
        };

        // make request to get the user cart items
        app.client.request(undefined, '/api/user/cart', 'GET', queryStringObject, undefined, function (statusCode, responsePayload, responseText) {
            if (statusCode !== 200) {
                if (statusCode === 403) {
                    // log out the user
                    app.logUserOut();
                } else {
                    window.alert(responsePayload.error)
                }
            } else {
                document.getElementById('cartContainer').innerHTML = responseText;
                // add listner to the place order button
                app.placeOrderButton();
            }
        });
    }
}

// add listner to the place order button
app.placeOrderButton = function () {
    if (document.getElementById('cartContainer')) {
        const container = document.getElementById('cartContainer');

        const buttons = container.getElementsByTagName('button')

        for (let i = 0; i < buttons.length; ++i) {
            buttons[i].addEventListener('click', function (e) {
                // prevent default
                e.preventDefault();

                const payload = {
                    'email': app.config.sessionToken.email,
                    'cartItemId': buttons[i].id
                };


                document.getElementById('cartContainer').innerHTML = '<div class="loader"></div>';
                // make request to place order
                app.client.request(undefined, '/api/createorder', 'POST', undefined, payload, function (statusCode, responsePayload) {
                    if (statusCode !== 200) {
                        if (statusCode === 403) {
                            // log out the user
                            app.logUserOut();
                        } else {
                            window.alert(responsePayload.error);
                            app.addCartItemsToCartContainer();
                        }
                    } else {
                        window.alert('Order placed, please check your mail.');
                        app.addCartItemsToCartContainer();
                    }
                });
            });
        }

    }
}

// log the user out then redirect them
app.logUserOut = function () {
    // get the current token id
    const tokenID = typeof (app.config.sessionToken.id) === 'string' ? app.config.sessionToken.id : false;

    // send the current token to the tokens endpoint to delete it
    const queryStringObject = {
        'id': tokenID
    };

    app.client.request(undefined, 'api/tokens', 'DELETE', queryStringObject, undefined, function (statusCode, responsePayload) {
        // set the app.config token as false
        app.setSessionToken(false);

        // send the user to home page
        window.location = '/';
    });
}

// load the account settings page data
app.loadAccountSettingData = function () {
    if (document.getElementById('accountSetting')) {
        // get the email of the current uer from the token stored, or log out the user if none is there
        const email = typeof (app.config.sessionToken.email) === 'string' ? app.config.sessionToken.email : false;
        if (email) {
            // fetch the user data
            const queryStringObject = {
                'email': email
            };

            // make request
            app.client.request(undefined, '/api/users', 'GET', queryStringObject, undefined, function (statusCode, responsePayload) {
                if (statusCode === 200) {
                    document.getElementById('accountEdit1').elements['email'].value = responsePayload.email;
                    document.getElementById('accountEdit2').elements['email'].value = responsePayload.email;
                    document.getElementById('accountEdit3').elements['email'].value = responsePayload.email;
                    document.getElementById('accountEdit1').elements['firstName'].value = responsePayload.firstName;
                    document.getElementById('accountEdit1').elements['lastName'].value = responsePayload.lastName;
                    document.getElementById('accountEdit1').elements['phone'].value = responsePayload.phone;
                    document.getElementById('accountEdit1').elements['address'].value = responsePayload.address;
                } else {
                    // if the status code is not 200, log the user out (api might be temporarily down or the user token is invalid)
                    app.logUserOut();
                }
            });
        } else {
            // log out the user
            app.logUserOut();
        }
    }
}

// init (bootstrapping) 
app.init = function () {
    // get the session token
    app.getSessionToken();
    // renew token
    app.tokenRenewalLoop();
    // bind the all form submission
    app.bindForms();
    // bind log out button
    app.bindLogoutButton();
    //bind itemList button
    app.bindItemList();
    // bind item list button in navbar
    app.bindItemListInNav();
    // bind itemsContainer
    app.bindItemsContainer();
    // bind user cart button
    app.addCartItemsToCartContainer();
    // load account setting page data
    app.loadAccountSettingData();
};

// call the init processes after the window loads
window.onload = function () {
    app.init()
};