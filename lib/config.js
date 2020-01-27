/**
 * Environment Configuration
 */

// container for all the environment
const environments = {};

// default: staging environment
environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging',
    'hashingSecret': 'SecretKeyForStaging',
    'stripe': {
        'authKey': 'add_your_stripe_test_key_here'
    },
    'mailgun': {
        'domain': 'add_your_mail_gun_domain_name_here',
        'authKey': 'api:add_your_mail_gun_auth_key_here'
    },
    'templateGlobals': {
        'appName': 'PizzyHut',
        'companyName': 'A Pizza Company, Inc.',
        'yearCreated': '2019',
        'baseUrl': 'http://localhost:3000'
    }
};

// default: staging environment
environments.testing = {
    'httpPort': 4000,
    'httpsPort': 4001,
    'envName': 'testing',
    'hashingSecret': 'SecretKeyForStaging',
    'stripe': {
        'authKey': 'add_your_stripe_test_key_here'
    },
    'mailgun': {
        'domain': 'add_your_mail_gun_domain_name_here',
        'authKey': 'api:add_your_mail_gun_auth_key_here'
    },
    'templateGlobals': {
        'appName': 'PizzyHut',
        'companyName': 'A Pizza Company, Inc.',
        'yearCreated': '2019',
        'baseUrl': 'http://localhost:3000'
    }
};

// produnction environment
environments.production = {
    'httpPort': 80,
    'httpsPort': 443,
    'envName': 'production',
    'hashingSecret': 'SecretKeyForProduction',
    'stripe': {
        'authKey': 'add_your_stripe_test_key_here'
    },
    'mailgun': {
        'domain': 'add_your_mail_gun_domain_name_here',
        'authKey': 'api:add_your_mail_gun_auth_key_here'
    },
    'templateGlobals': {
        'appName': 'PizzyHut',
        'companyName': 'A Pizza Company, Inc.',
        'yearCreated': '2019',
        'baseUrl': 'http://localhost:80'
    }
};

// determine the current environment (NODE_ENV)
const currentEnvironment = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// check if currentEnvironment is specified in config
const environmentToExport = typeof (environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;

// export module
module.exports = environmentToExport