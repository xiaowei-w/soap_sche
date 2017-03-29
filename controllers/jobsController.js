'use strict';

var tasks = require('../models/cronjobs')();
var resources = require('../models/db')()
var moment= require('moment-timezone');
const util = require('util');


exports.ListAll = function( req, res, next ) {
    resources.getAllJobs(
        function(err) {
            res.status(404).send();
        },
        function(rows) {
            res.json( { jobs: rows });
        });
};

exports.displayNewJob = function( req, res, next ) {
    var start = new moment();
    var end = NaN;
    if (req.query.start != 'undefined') {
        start = new moment( req.query.start );
    }
    if (req.query.end != 'undefined') {
        end = new moment( req.query.end );
    }
    var details = {};
    details['start_dow'] = start.day();
    details['start_hr'] = start.hour();
    details['start_min'] = start.minutes();
    
    var duration = moment.duration(end.diff(start));
    details['duration_hr'] = duration.asMinutes() / 60;
    details['duration_min'] = duration.asMinutes() % 60;

    details['target_res'] = req.query.resource;
    console.log(details);
    resources.getResourceData(
        function(err) {
            res.status(404).send();
        },
        function(rows) {
            res.render('newjob', { resources: rows, param : details });
        }
    );
    
};

exports.processNewJob = function( req, res, next ) {
    // console.log(req);
    // TODO: Validation of params

    var job_details = {};

    job_details['$name']         = req.body.name;
    job_details['$resource_id']  = req.body.resource;
    job_details['$start_hr']     = req.body.start_hr;
    job_details['$start_min']    = req.body.start_min;
    job_details['$start_dow']    = JSON.stringify(req.body.start_dow);
    job_details['$start_cmd']    = req.body.start_cmd;
    job_details['$duration_hr']  = req.body.duration_hr;
    job_details['$duration_min'] = req.body.duration_min;
    job_details['$end_cmd']      = req.body.end_cmd;
    
    // Validate resource_id
    resources.getResourceByID( job_details['$resource_id'], 
        function(err) {
            res.status(404).send();
        },
        function(row) {
            if ( row == undefined ) {
                // No such resource. return 403
                res.status(404).send({ result: "No such resource" });
                return
            }

            // Saving to DB
            resources.addJob( job_details,
                function(err) {
                    res.status(404).send();
                },
                function(row) {
                    // Saving to system crontab
                    // var crontab = tasks.getCronTab();
                    // var job = crontab.create(start_cmd, util.format('%d %d * * %s', start_min, start_hr, start_dow) );

                    // crontab.save(function(err, crontab) {});

                    res.status(200).send({result:"OK"});
                }
            );

        }
    )
};