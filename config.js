'use strict';

var config = {};
 
config.development = {
    application: {
        port: process.env.PORT || '8000'
    },
     
};
 
config.production = {
    application: {
        port: process.env.PORT || '80'
    },
};
 
config.environment = process.env.ENVIRON || 'development';
config.enable_cron_write = process.env.CRON_WRITE || false;

module.exports = config;