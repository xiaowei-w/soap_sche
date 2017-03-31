'use strict';

var tasks = require('../models/cronjobs')();
var resources = require('../models/db')()
var moment= require('moment-timezone');
const util = require('util');
var config = require('../config');

function send404Error( err ) { res.status(404).send({ result: "ERROR", message:"Not Found" }); };

exports.ListAll = function( req, res, next ) {
    resources.getAllJobs(
        function(err) {
            res.status(404).send({ result: "ERROR", message:"Not Found" });
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
    details['start_dow'] = [start.day()];
    details['start_hr'] = start.hour();
    details['start_min'] = start.minutes();
    
    var duration = moment.duration(end.diff(start));
    details['duration_hr'] = duration.asMinutes() / 60;
    details['duration_min'] = duration.asMinutes() % 60;

    details['target_res'] = req.query.resource;
    // console.log(details);
    resources.getResourceData( send404Error,
        function(rows) {
            res.render('newjob', { resources: rows, param : details, send_path: '/job/add' });
        }
    );
    
};

exports.processAddJob = function( req, res, next ) {
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
    resources.getResourceByID( job_details['$resource_id'], send404Error,
        function(row) {
            if ( row == undefined ) {
                // No such resource. return 403
                res.status(403).send({ result: "ERROR", message:"No such resource" });
                return
            }

            // Saving to DB
            resources.addJob( job_details,
                function(err) {
                    res.status(404).send();
                },
                function(row) {
                    if (config.enable_cron_write == true) {
                        var crontab = tasks.getCronTab();
                        var job = crontab.create(job_details['$start_cmd'], 
                            util.format('%d %d * * %s', job_details['$start_min'], job_details['$start_hr'], req.body.start_dow), 
                            util.format('{ job_id : %d, job_name : %s }', row, job_details['$name'] ) );
                        
                        if ( job_details['$end_cmd'].length > 0 ) {
                            var job2 = crontab.create(job_details['$end_cmd'], 
                                util.format('%d %d * * %s', job_details['$start_min'], job_details['$start_hr'], req.body.start_dow), 
                                util.format('{ job_id : %d, job_name : %s }', row, job_details['$name'] ) );
                        }
                    }

                    crontab.save(function(err, crontab) {});

                    res.status(200).send({result:"OK", message:"Job Saved"});
                }
            );

        }
    )
};

exports.displayEditJob = function( req, res, next ) {
    var start = new moment();
    var end = NaN;
    if (req.query.start != 'undefined') {
        start = new moment( req.query.start );
    }
    if (req.query.end != 'undefined') {
        end = new moment( req.query.end );
    }
    
    var details = {};
    details['start_hr'] = start.hour();
    details['start_min'] = start.minutes();
    
    var duration = moment.duration(end.diff(start));
    details['duration_hr'] = Math.round(duration.asMinutes() / 60);
    details['duration_min'] = duration.asMinutes() % 60;
    
    var job_id = req.query.id;
    //console.log(details);
    resources.getJobByID( job_id, send404Error,
        function(result) {
            if ( result == undefined ) {
                // No such resource. return 403
                res.status(403).send({ result: "ERROR", message:"No such resource" });
                return
            }
            result['start_hr']      = details['start_hr'];
            result['start_min']     = details['start_min'];
            result['duration_hr']   = details['duration_hr'];
            result['duration_min']  = details['duration_min'];
            //console.log(result);
            // Set the post path
            resources.getResourceData( send404Error,
                function(rows) {
                    res.render('editjob', { resources: rows, param : result, send_path: '/job/update' });
                }
            );
        }
    );
};

exports.processUpdateJob = function( req, res, next ) {
    // console.log(req);
    // TODO: Validation of params

    var job_details = {};
    job_details['$job_id']           = req.body.id;                  
    job_details['$name']            = req.body.name;
    job_details['$resource_id']     = req.body.resource;
    job_details['$start_hr']        = req.body.start_hr;
    job_details['$start_min']       = req.body.start_min;
    job_details['$start_dow']       = JSON.stringify(req.body.start_dow);
    job_details['$start_cmd']       = req.body.start_cmd;
    job_details['$duration_hr']     = req.body.duration_hr;
    job_details['$duration_min']    = req.body.duration_min;
    job_details['$end_cmd']         = req.body.end_cmd;
    
    // Validate resource_id
    resources.getJobByID( job_details['$job_id'], send404Error,
        function(row) {
            if ( row == undefined ) {
                // No such resource. return 403
                res.status(403).send({ result: "ERROR", message:"No such resource" });
                return
            }

            // Saving to DB
            resources.updateJob( job_details,
                function(err) {
                    res.status(404).send();
                },
                function(row) {
                    // Saving to system crontab
                    // if (config.enable_cron_write == true) {
                    //     var crontab = tasks.getCronTab();
                    //     var job = crontab.create(job_details['$start_cmd'], 
                    //         util.format('%d %d * * %s', job_details['$start_min'], job_details['$start_hr'], req.body.start_dow), 
                    //         util.format('{ job_id : %d, job_name : %s }', job_details['$job_id'], job_details['$name'] ) );

                    //     crontab.save(function(err, crontab) {});
                    // }

                    res.status(200).send({result:"OK", message:"Updated!"});
                }
            );
        }
    )
};

exports.displayRemoveJob = function( req, res, next ) {
    
    var job_id = req.query.id;
    //console.log(details);
    resources.getJobByID( job_id, send404Error,
        function(result) {
            if ( result == undefined ) {
                // No such resource. return 403
                res.status(403).send({ result: "ERROR", message:"No such resource" });
                return
            }
            res.render('removejob', { param: result, send_path: '/job/del' });
        }
    );
};

exports.processDelJob = function( req, res, next ) {
    // console.log(req);
    // TODO: Validation of params

    var job_id = req.body.id;                  
    
    // Validate resource_id
    resources.getJobByID( job_id, send404Error,
        function(row) {
            if ( row == undefined ) {
                // No such resource. return 403
                res.status(403).send({ result: "ERROR", message:"No such resource" });
                return
            }

            // Saving to DB
            resources.delJob( job_id,
                function(err) {
                    res.status(404).send();
                },
                function(row) {
                    // Del to system crontab
                    // var crontab = tasks.getCronTab();
                    // var job = crontab.create(start_cmd, util.format('%d %d * * %s', start_min, start_hr, start_dow) );

                    // crontab.save(function(err, crontab) {});

                    res.status(200).send({result:"OK", message:"Updated!"});
                }
            );
        }
    )
};