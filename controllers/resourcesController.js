'use strict';
var resources = require('../models/resources')()

exports.getResources = function( req, res, next ) {
  var resource_data = resources.getResourceData()
  if ( resource_data != null) {
    res.json(resource_data);
  }
  else {
    res.status(404).send();
  }
};