'use strict';

var jobsCtrl = require('../controllers/jobsController')
var resourcesCtrl = require('../controllers/resourcesController')

module.exports = function(app){
    // Main Routes
    app.get('/', function( req, res, next ) {
        res.render('index', { title: 'Soap Weekly Scheduler' });
    });
    
    // Jobs
    app.get('/jobs', jobsCtrl.ListAll );                        // Get all Jobs
    app.get('/newjob', jobsCtrl.displayNewJob );                // Render New Job view
    app.post('/addjob', jobsCtrl.processNewJob );               // Add a new Job
    
    // Resource
    app.get('/resources', resourcesCtrl.getResources );          // Get all Resources
    app.get('/newresource', resourcesCtrl.displayNewResource );  // Render new Resource view
    app.post('/addresource', resourcesCtrl.processNewResource ); // Add a new Resource
    
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