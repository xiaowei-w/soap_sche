'use strict';

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
                onSuccessCallback( row );
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
                    onSuccessCallback(this.lastID)

                });
                db.run("END");
            });
        },

        getAllJobs( onErrorCallback, onSuccessCallback ) {
            var select_stmt = "SELECT job_id AS id, name, resource_id, ";
            select_stmt     += "start_hr, start_min, start_dow, start_cmd, ";
            select_stmt     += "duration_hr, duration_min, end_cmd ";
            select_stmt     += "FROM jobs WHERE toDelete = 0";

            db.all(select_stmt, function(err, row) {
                if (err) {
                    if ( onErrorCallback !== 'undefined' ) {
                        onErrorCallback(err);
                    }
                    return console.log(err);
                }
                onSuccessCallback( row );
            });
        },
        getJobByID( job_id, onErrorCallback, onSuccessCallback ) {
            var select_stmt = "SELECT job_id AS id, name, resource_id, ";
            select_stmt     += "start_hr, start_min, start_dow, start_cmd, ";
            select_stmt     += "duration_hr, duration_min, end_cmd ";
            select_stmt     += "FROM jobs WHERE toDelete = 0 AND id=?";
            
            db.get(select_stmt, job_id, function(err, row) {
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
            var insert_stmt = "INSERT into jobs ( "
            insert_stmt     += " name, resource_id, start_hr, start_min, start_dow, start_cmd"
            insert_stmt     += ", duration_hr, duration_min, end_cmd ) "
            insert_stmt     += " VALUES ( $name, $resource_id, $start_hr, $start_min, $start_dow, $start_cmd"
            insert_stmt     += ", $duration_hr, $duration_min, $end_cmd )"
                
            db.serialize( function() {
                db.run("BEGIN  TRANSACTION");
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
        updateJob( job_detail, onErrorCallback, onSuccessCallback ) {
            var update_stmt = "UPDATE jobs SET ";
            update_stmt     += "name=$name, resource_id=$resource_id, ";
            update_stmt     += "start_hr=$start_hr, start_min=$start_min, ";
            update_stmt     += "start_dow=$start_dow, start_cmd==$start_cmd, ";
            update_stmt     += "duration_hr=$duration_hr, duration_min=$duration_min, end_cmd=$end_cmd ";
            update_stmt     += "WHERE job_id=$job_id";

            db.serialize( function() {
                db.run("BEGIN TRANSACTION");
                db.run(update_stmt, job_detail, function (e){
                    if (e) {
                        console.log(e);
                        onErrorCallback(e);
                        return
                    }
                    onSuccessCallback(this.lastID)

                });
                db.run("END");
            });
        },
    }
}