/**
 * CLI related task
 */

// dependencies
const events = require('events');
const _crud = require('./crud');
const readLine = require('readline');

// const util = require('util');
// const debug = util.debuglog('cli');

// event instance
class _Events extends events { };
const e = new _Events();

// initiate cli module
const cli = {};

// input processor
cli.processInput = function (str) {
    str = typeof (str) === 'string' && str.trim().length > 0 ? str.trim() : false;

    // check for valid cli option
    if (str) {
        // codify the unique str that identify the unique question allowed to be checked
        const uniqueInputs = [
            'man',
            'help',
            'exit',
            'list menu items',
            'list orders',
            'list new orders',
            'order details',
            'list users',
            'list new users',
            'user details',
        ];

        // go through possible input, exit an event when a possible match is found
        let matchFound = false;
        let counter = 0;

        uniqueInputs.some(input => {
            if (str.toLowerCase().indexOf(input) > -1) {
                matchFound = true;
                // emit an event matching the unique input, pass the full string given by the user
                e.emit(input, str);
            }
        });

        // if no match is found, tell the user to try again
        if (!matchFound) {
            console.log('Sorry try again. Use "help" to check availabe options.');
        }
    }
};

// init
cli.init = function () {
    // send the start message to the console
    console.log('\x1b[34m%s\x1b[0m', 'The CLI is running.');

    // start the interface
    const _interface = readLine.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: ''
    });

    // create an initial prompt
    _interface.prompt();

    // handle each line of input separately
    _interface.on('line', function (str) {
        // send str to the input processor
        cli.processInput(str);
        // re-initialise the promt afterwards
        _interface.prompt();
    });
};

// vertical space
cli.verticalSpace = function (lines) {
    lines = typeof (lines) === 'number' && lines > 0 ? lines : 1;
    for (i = 0; i < lines; ++i) {
        console.log('');
    }
};

// horizontal line
cli.horizontalLine = function () {
    // get the available screen size
    const width = process.stdout.columns;

    let line = '';

    for (i = 0; i < width; ++i) {
        line += '-';
    }
    console.log(line);
};

// centered text on the screen
cli.centered = function (str) {
    str = typeof (str) === 'string' && str.trim().length > 0 ? str.trim() : '';

    // get the available screen size
    const width = process.stdout.columns;

    // calculate the left padding 
    const leftPadding = Math.floor((width - str.length) / 2);

    // put he left padded spaces before the string
    let line = '';

    for (i = 0; i < leftPadding; ++i) {
        line += ' ';
    }
    line += str;
    console.log(line);
}

// input handlers:
e.on('exit', function () {
    cli.responders.exit();
});

e.on('man', function () {
    cli.responders.help();
});

e.on('help', function () {
    cli.responders.help();
});

e.on('list menu items', function () {
    cli.responders.listMenuItems();
});

e.on('list new orders', function () {
    cli.responders.listNewOrders();
});

e.on('order details', function (str) {
    cli.responders.orderDetails(str);
});

e.on('list new users', function () {
    cli.responders.listNewUsers();
});

e.on('user details', function (str) {
    cli.responders.userDetails(str);
});

e.on('list users', function () {
    cli.responders.listUsers();
});

e.on('list orders', function () {
    cli.responders.listOrders();
})

// responder handler object
cli.responders = {};

// exit responders
cli.responders.exit = function () {
    process.exit(0);
};

// help responder
cli.responders.help = function () {
    const commands = {
        'man': 'Show this help page',
        'help': 'Alias of the "man" command',
        'exit': 'Kill the CLI (and rest of the application)',
        'list menu items': 'Show list of all the menu items available.',
        'list orders': 'Show list of all the orders placed',
        'list new orders': 'Show list of all the orders place in the last 24hrs',
        'order details --{orderID}': 'Show the details of the specific order',
        'list users': 'Show the list of all the registered users (email)',
        'list new users': 'List all the users who have signed up in the last 24hrs',
        'user details --{userEmail}': 'Show the details of the specfic user',
    };

    // show a header for the help page that is as wide as the screen
    cli.horizontalLine();
    cli.centered('CLI MANUAL');
    cli.horizontalLine();
    cli.verticalSpace(2);

    //  show each command followed by its explaination
    for (let key in commands) {
        if (commands.hasOwnProperty(key)) {

            const value = commands[key];
            let line = '\x1b[33m' + key + '\x1b[0m';
            const padding = 60 - line.length;
            for (i = 0; i < padding; ++i) {
                line += ' ';
            }
            line += value;
            console.log(line);
            cli.verticalSpace();
        }
    }

    cli.verticalSpace(2);

    // end with another horizontal line
    cli.horizontalLine();
};

// list menu items responder
cli.responders.listMenuItems = function () {
    cli.horizontalLine();
    cli.centered('Menu Items with there price (Paise)');
    cli.horizontalLine();
    cli.verticalSpace();
    // lookup shopping menu items
    _crud.read('shoppingItems', 'items', function (err, itemsData) {
        if (!err && itemsData) {

            if (JSON.stringify(itemsData) !== '{}') {
                console.dir(itemsData, { 'colors': true });
                cli.verticalSpace();
            }
            cli.horizontalLine();
        }
    });

};

// list new orders responder
cli.responders.listNewOrders = function () {
    cli.horizontalLine();
    cli.centered('List of Orders Placed Within Last 24hrs (Order ID)');
    cli.horizontalLine();
    cli.verticalSpace();

    // lookup the registered users in the system
    _crud.listFiles('userOrders', function (err, fileNames) {
        if (!err && fileNames.length > 0) {

            for (let i = 0; i < fileNames.length; ++i) {
                // read the user data and check the created on time
                // created on time should be <= 24hrs
                const id = fileNames[i].split('.json')[0]

                _crud.read('userOrders', id, function (err, orderData) {
                    if (!err && orderData) {
                        const timeSpent = (Date.now() - orderData.orderTime) / (1000 * 60 * 60);
                        if (timeSpent <= 24) {
                            console.log('Order ID: \x1b[33m%s\x1b[0m', id);
                        }
                        cli.verticalSpace();
                    }
                });
            }
        }
    });

};

// list orders responder
cli.responders.listOrders = function () {
    cli.horizontalLine();
    cli.centered('List of All The Orders Placed (Order ID)');
    cli.horizontalLine();
    cli.verticalSpace();

    // lookup the registered users in the system
    _crud.listFiles('userOrders', function (err, fileNames) {
        if (!err && fileNames.length > 0) {

            for (let i = 0; i < fileNames.length; ++i) {
                const id = fileNames[i].split('.json')[0];
                // print the order id 
                console.log('Order ID: \x1b[33m%s\x1b[0m', id);
                cli.verticalSpace();
            }
        }
    });
}

// order details responder
cli.responders.orderDetails = function (str) {
    // get the id from the string provided
    const arr = str.split('--');
    const orderID = typeof (arr[1]) === 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;
    cli.horizontalLine();
    cli.centered('Order Details')
    cli.horizontalLine();

    if (orderID) {
        // lookup the order
        _crud.read('userOrders', orderID, function (err, orderData) {
            if (!err && orderData) {
                cli.verticalSpace();
                // print the order details
                console.dir(orderData, { 'colors': true });
                cli.verticalSpace();
                cli.horizontalLine();
                cli.verticalSpace();
            }
        });
    }
};

// list new users responder
cli.responders.listNewUsers = function () {
    cli.horizontalLine();
    cli.centered('List of Users Signed Up Within Last 24hrs');
    cli.horizontalLine();
    cli.verticalSpace();

    // lookup the registered users in the system
    _crud.listFiles('users', function (err, fileNames) {
        if (!err && fileNames.length > 0) {

            for (let i = 0; i < fileNames.length; ++i) {
                // read the user data and check the created on time
                // created on time should be <= 24hrs
                const id = fileNames[i].split('.json')[0]

                _crud.read('users', id, function (err, userData) {
                    if (!err && userData) {
                        const timeSpent = (Date.now() - userData.accountCreatedOn) / (1000 * 60 * 60);
                        if (timeSpent <= 24) {
                            console.log('\x1b[33m%s\x1b[0m', id);
                        }
                        cli.verticalSpace();
                    }
                });
            }
        }
    });
};

// list users responder
cli.responders.listUsers = function () {
    cli.horizontalLine();
    cli.centered('List of All Registered Users (email)');
    cli.horizontalLine();
    cli.verticalSpace();

    // lookup the registered users in the system
    _crud.listFiles('users', function (err, fileNames) {
        if (!err && fileNames.length > 0) {

            for (let i = 0; i < fileNames.length; ++i) {

                const id = fileNames[i].split('.json')[0];
                // print the email
                console.log('email: \x1b[33m%s\x1b[0m', id);
                cli.verticalSpace();
            }
        }
    });
};

// user details responder
cli.responders.userDetails = function (str) {
    // get the email form the string provided
    const arr = str.split('--');
    const email = typeof (arr[1]) === 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;
    cli.horizontalLine();
    cli.centered('User Details');
    cli.horizontalLine();
    if (email) {
        // lookup the user
        _crud.read('users', email, function (err, userData) {
            if (!err && userData) {
                delete userData.password;
                cli.verticalSpace();
                // print the user details
                console.dir(userData, { 'colors': true });
                cli.verticalSpace()
                cli.horizontalLine();
                cli.verticalSpace();
            }
        });
    }
};



// export the module
module.exports = cli;


