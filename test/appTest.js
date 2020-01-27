/**
 * /app/lib test 
 */

// dependencies
const appLib = require('../app/lib');
const assert = require('assert');

// holder for the appTest
const appTest = {};

// assert that the palindromeCheck function returns a boolean value for valid input (string input)
appTest['appLib.palindromeCheck should return boolean for valid input(string)'] = function (done) {
    const val = appLib.palindromeCheck('aff');
    assert.equal(typeof (val), 'boolean');
    done();
};

// assert that the palindromeCheck function throws error if the input is invalid(non string input)
appTest['appLib.palindromeCheck should throws error for invalid input(non string)'] = function (done) {
    assert.doesNotThrow(function () {
        appLib.palindromeCheck(123);
    }, TypeError);
    done();
};

// assert that the palindromeCheck function return true/false for valid input
// returns true for palindrome string , eg: 'abba'
appTest['appLib.palindromeCheck should return true for a palindrome string'] = function (done) {
    const val = appLib.palindromeCheck('abba');
    assert.equal(val, true);
    done();
};
// returns false for non-palindrome string , eg: 'qwer'
appTest['appLib.palindromeCheck should return false for a non-palindrome string'] = function (done) {
    const val = appLib.palindromeCheck('qwer');
    assert.equal(val, false);
    done();
};


// assert that the checkOddEven function returns boolean value if the input is valid (number input)
appTest['appLib.checkOddEven should return boolean for valid input(number)'] = function (done) {
    const val = appLib.checkOddEven(123);
    assert.equal(typeof (val), 'boolean');
    done();
};

// assert that the checkOddEven function throws error if the input is invalid (non number input)
appTest['appLib.checkOddEven should throws error for invalid input(non-number)'] = function (done) {
    assert.doesNotThrow(function () {
        appLib.checkOddEven('123');
    }, TypeError);
    done();
};

// assert that the checkOddEven function return true/false for valid input
// returns true for even number , eg: 10
appTest['appLib.checkOddEven should return true for a even number'] = function (done) {
    const val = appLib.checkOddEven(10);
    assert.equal(val, true);
    done();
};
// returns false for odd number , eg: 7
appTest['appLib.checkOddEven should return false for a odd number'] = function (done) {
    const val = appLib.checkOddEven(7);
    assert.equal(val, false);
    done();
};


// export the appTest
module.exports = appTest;