'use strict';

var tasks = require('../models/cronjobs')();

exports.ListAll = function( req, res, next ) {
    // console.log(tasks.getCronTab());
    var jobs = tasks.getCronTab().jobs();
    var jobs_str_array = [];
    for ( var idx = 0; idx < jobs.length; idx++ ) {
        jobs_str_array[idx] = jobs[idx].render();
    }

    res.json(jobs_str_array);
}