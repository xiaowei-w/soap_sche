/**
 * jobsController
 *
 * @description :: Server-side logic for managing jobs
 * 
 */
var crontab = require('crontab');
var cronlist;

crontab.load(function(err, crontab) {
  if (err) {
    return console.error(err);
  }
  cronlist = crontab
});


exports.ListAll = function( req, res, next ) {
    var jobs = cronlist.jobs();
    var jobs_str_array = [];
    for ( idx = 0; idx < jobs.length; idx++ ) {
        jobs_str_array[idx] = jobs[idx].render();
    }

    res.json(jobs_str_array);
}