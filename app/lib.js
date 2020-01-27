/**
 * library of some simple functions
 */

// lib container
const lib = {};

// palindrom check (input: string type)
lib.palindromeCheck = function (str) {
    str = typeof (str) === 'string' ? str : false;
    if (str) {
        // string reverse
        const strRev = str.split('').reverse().join('');
        // palindrome check
        const res = str === strRev ? true : false;
        // return result
        return res;
    } else {
        throw 'Input provided is not a string.';
    }
};

// check odd/even
lib.checkOddEven = function (num) {
    num = typeof (num) === 'number' ? num : false;
    if (num) {
        const res = num % 2 === 0 ? true : false;
        return res;
    } else {
        throw 'Input provided is not a number.'
    }
};


// export lib
module.exports = lib;

