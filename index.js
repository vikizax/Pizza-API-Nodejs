/**
 * Initial Primary file for the API
 * Starts the app
 */

// dependecies
const server = require('./lib/server');
const cli = require('./lib/cli');

// declare the app
const app = {};

// initiate function
app.init = function () {
    // Start the server
    server.init();

    // start the cli
    setTimeout(function() {
        cli.init()
    }, 50);
};

// execute
app.init();

// export the app
module.exports = app;