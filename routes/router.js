'use strict';

var jobsCtrl = require('../controllers/jobsController')
var resourcesCtrl = require('../controllers/resourcesController')

module.exports = function(app){
    // Main Routes
    app.get('/', function( req, res, next ) {
        res.render('index', { title: 'Soap Weekly Cron Scheduler' });
    });
    
    // Jobs
    app.get('/job/list',        jobsCtrl.ListAll );                     // Get all Jobs

    app.get('/job/new',         jobsCtrl.displayNewJob );               // Render New Job view
    app.post('/job/add',        jobsCtrl.processAddJob );               // Add a new Job

    app.get('/job/edit',        jobsCtrl.displayEditJob );              // Render Edit Job view
    app.post('/job/update',     jobsCtrl.processUpdateJob );            // Add a new Job
    
    app.get('/job/remove',      jobsCtrl.displayRemoveJob );            // Render new Resource view
    app.post('/job/del',        jobsCtrl.processDelJob );               // Delete a new Resource row
    
    // Resource
    app.get('/resource/list',   resourcesCtrl.getResources );           // Get all Resources

    app.get('/resource/new',    resourcesCtrl.displayNewResource );     // Render new Resource view
    app.post('/resource/add',   resourcesCtrl.processAddResource );     // Add a new Resource row
    
    app.get('/resource/remove', resourcesCtrl.displayRemoveResource );  // Render new Resource view
    app.post('/resource/del',   resourcesCtrl.processDelResource );     // Delete a new Resource row
    

    // Fall through
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handler
    app.use(function(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });
 
};