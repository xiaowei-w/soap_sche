'use strict';

var tasks = require('../models/cronjobs')();
var resources = require('../models/resources')()
var moment= require('moment-timezone');

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
    console.log(req);
};