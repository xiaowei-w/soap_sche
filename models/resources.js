'use strict';

var fs = require('fs');
var config = require('../config');
var resource = null;

fs.readFile( config[config.environment].resource_file, 'utf8', function( err, data ) {
    if ( err ) {
        console.log(err);
        return
    }
    
    resource = JSON.parse(data);
})

module.exports = function () {
    return {
        getResourceData() {
            return resource;
        },
        getResourceFileName() {
            return config[config.environment].resource
        }
    }
}