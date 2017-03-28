'use strict';
var resources = require('../models/resources')()

exports.getResources = function( req, res, next ) {
    resources.getResourceData( 
        function(err) {
            res.status(404).send();
        },
        function(rows) {
            res.json(rows);
        }
    );

};

exports.displayNewResource = function( req, res, next ) {
    res.render('newresource');
};

exports.processNewResource = function( req, res, next ) {

    //console.log(req);
    // TODO: Validation of params
    
    var name = req.body.name;
    resources.addResource( name, 
        function(err) {
            res.status(404).send();
        },
        function(data) {
            res.status(200).send({result:"OK"});
        }
    );

};