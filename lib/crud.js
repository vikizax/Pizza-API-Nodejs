/**
 * Library for storing and editing data
 */

// dependencies
const fs = require('fs');
const path = require('path')
const helpers = require('./helpers');

// container for the module
const crud = {};

// base directory of the data folder
crud.baseDir = path.join(__dirname, '/../.data/')

// create/write data to a file
crud.create = function (dir, file, data, callback) {
    // open the file for writing
    fs.open(crud.baseDir + dir + '/' + file + '.json', 'wx', function (err, fileDescriptor) {
        if (!err && fileDescriptor) {
            // convert the data to string
            const stringData = JSON.stringify(data);

            // write to the file and close it
            fs.write(fileDescriptor, stringData, function (err) {
                if (!err) {
                    // close the file
                    fs.close(fileDescriptor, function (err) {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error closing the file');
                        }
                    });
                } else {
                    callback('Error writing to new file.');
                }
            });
        } else {
            callback("Could not create new file, it already exists.");
        }
    });
};

// read data from a file
crud.read = function (dir, file, callback) {
    fs.readFile(crud.baseDir + dir + '/' + file + '.json', 'utf8', function (err, data) {
        if (!err && data) {
            // convert the file data string to json object
            const dataObject = helpers.parseStringToJsonObject(data);
            callback(false, dataObject);
        } else {
            callback(err, data);
        }
    });
};

// update data inside a file
crud.update = function (dir, file, data, callback) {
    // open file for writing
    fs.open(crud.baseDir + dir + '/' + file + '.json', 'r+', function (err, fileDescriptor) {
        if (!err && fileDescriptor) {
            // convert the data to string
            const stringData = JSON.stringify(data);

            // truncate the content of a file
            fs.truncate(fileDescriptor, function (err) {
                if (!err) {
                    // update the file with new data
                    fs.writeFile(fileDescriptor, stringData, function (err) {
                        if (!err) {
                            // close the file
                            fs.close(fileDescriptor, function (err) {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('Error closing the file that has been updated.');
                                }
                            });
                        } else {
                            callback('Error updating the file.');
                        }
                    });
                } else {
                    callback('Error truncating the file.')
                }
            });
        } else {
            callback('Could not open file for updating, it may not exist yet.');
        }
    });
};

// delete a file
crud.delete = function (dir, file, callback) {
    // unlink the file
    fs.unlink(crud.baseDir + dir + '/' + file + '.json', function (err) {
        if (!err) {
            callback(false);
        } else {
            callback('Error deleting the file.')
        }
    });
}

// return list dir files name
crud.listFiles = function (dir, callback) {
    // lookup the directory provided
    fs.readdir(crud.baseDir + dir, function (err, fileNames) {
        if (!err && fileNames) {
            callback(false, fileNames);
        } else {
            callback(err, fileNames);
        }
    })
}

// export the module
module.exports = crud;