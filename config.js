'use strict';

var config = {};
 
config.development = {
    application: {
        port: process.env.PORT || '8000'
    },
    resource_file: process.env.RESOURCE_FILE || 'data/resource.json'
     
};
 
config.production = {
    application: {
        port: process.env.PORT || '80'
    },
    resource_file: process.env.RESOURCE_FILE || 'data/resource.json'     
};
 
config.environment = process.env.ENVIRON || 'development';
 
module.exports = config;