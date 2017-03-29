'use strict';
var resources = require('../models/db')()

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

exports.displayRemoveResource = function( req, res, next ) {
    resources.getResourceData( 
        function(err) {
            res.status(404).send();
        },
        function(rows) {
            res.render('removeresource', { resources: rows } );
        }
    );
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

exports.processDelResource = function( req, res, next ) {
    //console.log(req);
    // TODO: Validation of params
    var resource_id = req.body.resource;
    
    resources.delResource( resource_id, 
        function(err) {
            res.status(404).send();
        },
        function(data) {
            res.status(200).send({result:"OK"});
        }
    );
};