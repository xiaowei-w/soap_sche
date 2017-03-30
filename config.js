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
 
module.exports = config;