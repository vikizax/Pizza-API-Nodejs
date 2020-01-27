/**
 * Shopping item related task 
 */


// dependencies
const _crud = require('./crud');
const helpers = require('./helpers');

// container for shopdata
const shopdata = {};

// return the list of the shopping items available in server
shopdata.list = function (callback) {
    // lookup shopping menu items (.data/shoppingItems/items.json)
    _crud.read('shoppingItems', 'items', function (err, itemsData) {
        if (!err && itemsData) {
            // get the itemsData keys (name of the item)
            const items = Object.keys(itemsData);
            callback(items);
        } else {
            callback(false);
        }
    });
};

// return the item object (inlcudes item name and price)
shopdata.listWithPrice = function (callback) {
    // lookup shopping menu items (.data/shoppingItems/items.json)
    _crud.read('shoppingItems', 'items', function (err, itemsData) {
        if (!err && itemsData) {
            // return the items object
            callback(itemsData);
        } else {
            callback(false);
        }
    });
};

// add the shopping item to the provided user shopping cart
shopdata.addToCart = function (item, email, callback) {
    // validate itemList
    // const itemsToAdd = typeof (itemList) === 'object' && itemList instanceof Array && itemList.length > 0 ? itemList : false;
    item = typeof (item) === 'string' && item.length > 0 ? item : false;

    // if valid
    if (item) {
        let canAdd = true;
        // lookup shopping items
        shopdata.listWithPrice(function (itemData) {
            if (itemData) {
                // check if the item is available, if not stop the process
                // for (let i = 0; i < itemsToAdd.length; ++i) {
                // if does not exit
                if (!itemData.hasOwnProperty(item)) {
                    canAdd = false;
                }
                // }
                // if all the items are available
                if (canAdd) {
                    // cart details
                    const cartDetails = {
                        'items': {},
                        'userEmail': email
                    };
                    // create id for all the items selected by user
                    // itemsToAdd.forEach(item => {
                    const id = helpers.createRandomString(5);
                    cartDetails.items[id] = {
                        [item]: itemData[item]
                    };
                    // });

                    // add the items to the users cart
                    _crud.create('shoppingCart', email, cartDetails, function (err) {
                        // if the shoping cart file for the user does not exist
                        if (!err) {
                            callback(200, true);
                        } else {
                            // if the shopping cart file for the user already exist, then update it
                            // loopup the old shopping cart details
                            _crud.read('shoppingCart', email, function (err, cartData) {
                                if (!err && cartData) {
                                    // update the old shopping cart details
                                    cartData.items = { ...cartData.items, ...cartDetails.items };
                                    cartData.userEmail = cartDetails.userEmail;
                                    // store it
                                    _crud.update('shoppingCart', email, cartData, function (err) {
                                        if (!err) {
                                            callback(200, true);
                                        } else {
                                            callback(500, false);
                                        }
                                    });

                                } else {
                                    callback(500, false);
                                }
                            });
                        }
                    });
                } else {
                    callback(404, false);
                }
            } else {
                callback(500, false);
            }
        });
    } else {
        callback(403, false);
    }
};

// remove the item from the provided user cart
shopdata.removeFromCart = function (cartItemId, email, callback) {
    // validate cartItemId
    cartItemId = typeof (cartItemId) === 'string' && cartItemId.length === 5 ? cartItemId : false;
    if (cartItemId) {
        // lookup userCart items (.data/shoppingCart/)
        _crud.read('shoppingCart', email, function (err, cartData) {
            if (!err && cartData) {
                delete cartData.items[cartItemId]
                // update the user cart
                _crud.update('shoppingCart', email, cartData, function (err) {
                    if (!err) {
                        // cart update success
                        callback(200, true);
                    } else {
                        // could not update the user cart
                        callback(500, false);
                    }
                });
            } else {
                // user cart not found
                callback(400, false);
            }
        });
    } else {
        // invalid id
        callback(400, false);
    }
};

// return the list of the shopping items available in user cart
shopdata.listUserCartItems = function (email, callback) {
    // lookup userCart items (.data/shoppingCart/)
    _crud.read('shoppingCart', email, function (err, cartData) {
        if (!err && cartData) {
            callback(cartData.items);
        } else {
            callback(false);
        }
    });
};

shopdata.removeUserCart = function (email, callback) {
    // lookup if the cart details for the user is available
    _crud.read('shoppingCart', email, function (err, cartData) {
        if (!err && cartData) {
            // if cart details exist delete it
            _crud.delete('shoppingCart', email, function (err) {
                if (!err) {
                    callback(200, false);
                } else {
                    callback(500, 'Could not delete all the files of the specified user.');
                }
            });
        } else {
            // if cart details does not exit then do nothing
            callback(200, false);
        }
    });

};
// export the shopdata module
module.exports = shopdata;


