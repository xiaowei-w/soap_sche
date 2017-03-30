'use strict';
var resources = require('../models/db')()

exports.getResources = function( req, res, next ) {
    resources.getResourceData( 
        function(err) {
            res.status(404).send({ result: "ERROR", message:"Not Found" });
        },
        function(rows) {
            res.json(rows);
        }
    );

};

exports.displayNewResource = function( req, res, next ) {
    res.render('newresource', { send_path: '/resource/add' });
};

exports.processAddResource = function( req, res, next ) {
    //console.log(req);
    // TODO: Validation of params
    var name = req.body.name;

    resources.addResource( name, 
        function(err) {
            res.status(404).send({ result: "ERROR", message:"Not Found" });
        },
        function(data) {
            res.status(200).send({result:"OK", message:"Resource added"});
        }
    );
};

exports.displayRemoveResource = function( req, res, next ) {
    resources.getResourceData( 
        function(err) {
            res.status(404).send({ result: "ERROR", message:"Not Found" });
        },
        function(rows) {
            res.render('removeresource', { resources: rows, send_path: '/resource/del' } );
        }
    );
};

exports.processDelResource = function( req, res, next ) {
    //console.log(req);
    // TODO: Validation of params
    var resource_id = req.body.resource;
    
    resources.delResource( resource_id, 
        function(err) {
            res.status(404).send({ result: "ERROR", message:"Not Found" });
        },
        function(data) {
            res.status(200).send({result:"OK", message:"Resource successfully deleted"});
        }
    );
};