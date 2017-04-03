'use strict';

var tasks = require('../models/cronjobs')();
var resources = require('../models/db')()
var moment= require('moment-timezone');
const util = require('util');
var config = require('../config');

function send404Error( err ) { res.status(404).send({ result: "ERROR", message:"Not Found" }); };

function createToJobInstance( crontab, job_param ) {
    crontab.create(job_param['cmd'], 
        util.format('%d %d * * %s', job_param['min'], job_param['hr'], job_param['dow']), 
        util.format('{ job_id : %d, res_id : %d, job_name : %s}', job_param['id'], job_param['resource_id'], job_param['name'] ) );
    
}
function processCronWriting(job_details) {
    var crontab = tasks.getCronTab();
    var job_param = {   id: job_details['$job_id'], 
                        cmd : job_details['$start_cmd'],
                        min : parseInt(job_details['$start_min']), 
                        hr : parseInt(job_details['$start_hr']),
                        dow : JSON.parse(job_details['$start_dow']),
                        resource_id : job_details['$resource_id'],
                        name : job_details['$name']
                    };
    createToJobInstance( crontab, job_param );

    if ( job_details['$end_cmd'].length > 0 ) {
        var end_params = getEndTime(JSON.parse(job_details['$start_dow']), parseInt(job_details['$start_hr']),
                        parseInt(job_details['$start_min']), parseInt(job_details['$duration_hr']), 
                        parseInt(job_details['$duration_min']) ) ;
        
        job_param['cmd'] = job_details['$end_cmd'];
        job_param['min'] = parseInt(end_params['$end_min']);
        job_param['hr'] = parseInt(end_params['$end_hr']);
        job_param['dow'] = end_params['$end_dow'];
        
        createToJobInstance( crontab, job_param );
    }
    crontab.save(function(err, crontab) {});

}
function getEndTime( dow_array, start_hr, start_min, duration_hr, duration_min ) {
    var date = new Date();
    var end_hr = NaN;
    var end_min = NaN;
    var end_dow_array = [];
    for ( var idx=0; idx < dow_array.length; ++idx) {
        var currentDay = date.getDay();
        var distance = parseInt( dow_array[idx] ) - currentDay;
    
        date.setDate( date.getDate() + distance );
        date.setHours( start_hr );
        date.setMinutes( start_min );

        date.setHours(date.getHours()+ duration_hr );
        date.setMinutes(date.getMinutes()+ duration_min );
        
        end_dow_array.push( date.getDay() );
        end_hr = date.getHours();
        end_min = date.getMinutes();
    }
    // console.log( end_dow_array );
    // console.log( end_hr );
    // console.log( end_min );
    
    return { '$end_dow' : end_dow_array, '$end_hr' : end_hr, '$end_min' : end_min };
}

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
    job_details['$start_cmd']    = req.body.start_cmd;
    job_details['$duration_hr']  = req.body.duration_hr;
    job_details['$duration_min'] = req.body.duration_min;
    job_details['$end_cmd']      = req.body.end_cmd;
    
    if( Object.prototype.toString.call( req.body.start_dow ) === '[object Array]' ) {
        job_details['$start_dow']    = JSON.stringify(req.body.start_dow);
    } else {
        job_details['$start_dow']    = JSON.stringify([req.body.start_dow]);
    }
    
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
                    if ( row == undefined ) {
                        res.status(500).send({ result: "ERROR", message:"Internal server error: 100" });
                        return;
                    }
                    job_details['$job_id'] = row;

                    if (config.enable_cron_write == 'true') {
                        processCronWriting(job_details);
                    }

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
    job_details['$start_cmd']       = req.body.start_cmd;
    job_details['$duration_hr']     = req.body.duration_hr;
    job_details['$duration_min']    = req.body.duration_min;
    job_details['$end_cmd']         = req.body.end_cmd;
    
    if( Object.prototype.toString.call( req.body.start_dow ) === '[object Array]' ) {
        job_details['$start_dow']    = JSON.stringify(req.body.start_dow);
    } else {
        job_details['$start_dow']    = JSON.stringify([req.body.start_dow]);
    }

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
                function(new_row) {
                    // Update and save to system crontab
                    if (config.enable_cron_write == 'true') {
                        
                        var crontab = tasks.getCronTab();
                        // Look for the jobs
                        //console.log(row);
                        var jobs = crontab.jobs({ comment: util.format('job_id : %d', row['id'] ) });

                        crontab.remove(jobs);
                        crontab.save(function(err, crontab) {});

                        processCronWriting(job_details);
                        
                    }

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
                    if (config.enable_cron_write == 'true') {
                        // Del to system crontab
                        var crontab = tasks.getCronTab();   
                        // Look for the jobs
                        var jobs = crontab.jobs({ comment: util.format('job_id : %d', job_id ) });

                        crontab.remove(jobs);
                        crontab.save(function(err, crontab) {});
                    }
                    res.status(200).send({result:"OK", message:"Updated!"});
                }
            );
        }
    )
};