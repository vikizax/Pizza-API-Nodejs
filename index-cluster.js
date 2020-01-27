/**
 * Initial Primary file for the API
 * Starts the app
 */

// dependecies
const server = require('./lib/server');
const cli = require('./lib/cli');
const os = require('os');
const cluster = require('cluster');

// declare the app
const app = {};

// initiate function
app.init = function () {

    // if master thread, fork workers
    if (cluster.isMaster) {
        // start the cli
        setTimeout(function () {
            cli.init()
        }, 50);

        // create workers
        for (let i = 0; i < os.cpus().length; ++i) {
            cluster.fork();
        }
    } else {
        // if not master thread, start the server
        server.init();
    }
};

// execute
app.init();

// export the app
module.exports = app;