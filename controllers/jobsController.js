'use strict';

var tasks = require('../models/cronjobs')();
var resources = require('../models/resources')()
var moment= require('moment-timezone');
const util = require('util');


exports.ListAll = function( req, res, next ) {
    // console.log(tasks.getCronTab());
    var jobs = tasks.getCronTab().jobs();
    var jobs_str_array = [];
    for ( var idx = 0; idx < jobs.length; idx++ ) {
        jobs_str_array[idx] = jobs[idx].render();
    }

    res.json(jobs_str_array);
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
    
    details['end_dow'] = end.day();
    details['end_hr'] = end.hours();
    details['end_min'] = end.minutes();

    details['target_res'] = req.query.resource;
    var re = resources.getResourceData();
    res.render('newjob', { resources: re.resources, param : details });
};

exports.processNewJob = function( req, res, next ) {
    //console.log(req);
    // TODO: Validation of params

    var name = req.body.name;
    var resource = req.body.resource;
    var start_param = {};
    var end_param = {};
    
    var start_hr = req.body.start_hr;
    var start_min = req.body.start_min;
    var start_dow = req.body.start_dow;
    var start_cmd = req.body.start_cmd;
    
    var end_hr = req.body.end_hr;
    var end_min = req.body.end_min;
    var end_dow = req.body.end_dow;
    var end_cmd = req.body.en_cmd;
    
    var crontab = tasks.getCronTab();
    var job = crontab.create(start_cmd, util.format('%d %d * * %s', start_min, start_hr, start_dow) );

    crontab.save(function(err, crontab) {});
    res.status(200).send({result:"OK"});
};