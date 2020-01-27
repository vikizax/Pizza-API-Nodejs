/**
 * Test Runner
 */


// override the NODE_ENV variable
process.env.NODE_ENV = 'testing';

// app logic for the test runner
const _app = {};

// container for the test
_app.tests = {};

// add on the test
_app.tests.appTest = require('./appTest');

// count all the test
_app.countTest = function () {
    let counter = 0;

    for (let key in _app.tests) {
        if (_app.tests.hasOwnProperty(key)) {
            const subTests = _app.tests[key];
            for (let testName in subTests) {
                if (subTests.hasOwnProperty(testName)) {
                    counter++;
                }
            }
        }
    }

    return counter;
};

// run the test, collect the errors and successes
_app.runTests = function () {
    const errors = [];
    let successes = 0;
    const limit = _app.countTest();
    let counter = 0;

    for (let key in _app.tests) {
        if (_app.tests.hasOwnProperty(key)) {
            const subTests = _app.tests[key];
            for (let testName in subTests) {
                if (subTests.hasOwnProperty(testName)) {
                    (function () {
                        const tempTestName = testName;
                        const testValue = subTests[testName];

                        // call the test
                        try {
                            testValue(function () {
                                // if is calls back without throwing then it is a success
                                console.log('\x1b[32m%s\x1b[0m', tempTestName);
                                counter++;
                                successes++;
                                if (counter === limit) {
                                    _app.produceTestReport(limit, successes, errors);
                                }
                            });
                        } catch (e) {
                            // if it throws then it failed, captire the error thrown and log it in red
                            errors.push({
                                'error': e,
                                'name': tempTestName
                            });

                            console.log('\x1b[31m%s\x1b[0m', tempTestName);
                            counter++;
                            if (counter === limit) {
                                _app.produceTestReport(limit, successes, errors);
                            }
                        }
                    })();
                }
            }
        }
    }

};

// produce test report
_app.produceTestReport = function (limit, successes, errors) {
    console.log('');
    console.log('----------------BEGIN TEST REPORT----------------');
    console.log('');
    console.log('Total Test: ', limit);
    console.log('Pass: ', successes);
    console.log('Fail: ', errors.length);
    console.log('');

    // if there are errors, print the details
    if (errors.length > 0) {
        console.log('----------------BEGIN ERROR DETAILS----------------');
        console.log('');

        errors.forEach(err => {
            console.log('\x1b[31m%s\x1b[0m', err.name);
            console.log(err.error);
            console.log('');
        });

        console.log('');
        console.log('----------------END ERROR DETAILS----------------');
    }

    console.log('');
    console.log('----------------END TEST REPORT----------------');
    process.exit(0);

};

// run the test
_app.runTests();