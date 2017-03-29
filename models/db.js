'use strict';

var config = require('../config');
var path = require('path')
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(path.join(__dirname, '..', 'data', 'mydb.db'));

module.exports = function () {
    return {
        getResourceData( onErrorCallback, onSuccessCallback ) {
            db.all("SELECT resource_id AS id, name FROM resources WHERE toDelete = 0", function(err, row) {
                if (err) {
                    if ( onErrorCallback !== 'undefined' ) {
                        onErrorCallback(err);
                    }
                    return console.log(err);
                }
                //console.log(row.id + ": " + row.name);
                onSuccessCallback( row );
            });
        },
        getResourceFileName() {
            return config[config.environment].resource
        },
        addResource( resource_data, onErrorCallback, onSuccessCallback ) {
            db.serialize( function() {
                db.run("BEGIN TRANSACTION");
                db.run("INSERT into resources (name) VALUES (?)", resource_data, function (e){
                    if (e) {
                        console.log(e);
                        onErrorCallback(e);
                        return
                    }
                    //console.log("val  "+this.lastID);
                    onSuccessCallback(this.lastID)

                });
                db.run("END");
            });
        },
        delResource( resource_id, onErrorCallback, onSuccessCallback ) {
            db.serialize( function() {
                db.run("BEGIN TRANSACTION");
                db.run("UPDATE resources SET toDelete = 1 WHERE resource_id = ?", resource_id, function (e){
                    if (e) {
                        console.log(e);
                        onErrorCallback(e);
                        return
                    }
                    //console.log("val  "+this.lastID);
                    onSuccessCallback(this.lastID)

                });
                db.run("END");
            });
        },
        getResourceByID( resource_id, onErrorCallback, onSuccessCallback ) {
            db.get("SELECT resource_id AS id FROM resources WHERE toDelete = 0 AND resource_id = ?", resource_id,
                function(err, row) {
                    if (err) {
                        if ( onErrorCallback !== 'undefined' ) {
                            onErrorCallback(err);
                        }
                        return console.log(err);
                    }
                    
                    onSuccessCallback( row );
                }
            );
        },
        getAllJobs( onErrorCallback, onSuccessCallback ) {
            db.all("SELECT job_id AS id, name, resource_id, start_hr, start_min, start_dow, start_cmd, end_hr, end_min, end_dow, end_cmd FROM jobs WHERE toDelete = 0", function(err, row) {
                if (err) {
                    if ( onErrorCallback !== 'undefined' ) {
                        onErrorCallback(err);
                    }
                    return console.log(err);
                }
                onSuccessCallback( row );
            });
        },
        addJob( job_detail, onErrorCallback, onSuccessCallback ) {
            db.serialize( function() {
                db.run("BEGIN  TRANSACTION");
                var insert_stmt = "INSERT into jobs ( "
                insert_stmt     += " name, resource_id, start_hr, start_min, start_dow, start_cmd"
                insert_stmt     += ", duration_hr, duration_min, end_cmd ) "
                insert_stmt     += " VALUES ( $name, $resource_id, $start_hr, $start_min, $start_dow, $start_cmd"
                insert_stmt     += ", $duration_hr, $duration_min, $end_cmd )"
                
    
                db.run(insert_stmt, job_detail, function (e){
                    if (e) {
                        console.log(e);
                        onErrorCallback(e);
                        return
                    }
                    //console.log("val  "+this.lastID);
                    onSuccessCallback(this.lastID)

                });
                db.run("END");
            });
        },
    }
}