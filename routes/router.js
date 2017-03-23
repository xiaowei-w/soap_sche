'use strict';

var jobs = require('../controllers/jobsController')
var resources = require('../controllers/resourcesController')


module.exports = function(app){
    // Main Routes
    app.get('/', function( req, res, next ) {
        res.render('index', { title: 'Soap Weekly Scheduler' });
    });
 
    app.get('/jobs', jobs.ListAll );
    
    app.get('/resources', resources.getResources );

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