'use strict';

var config = require('../config');
var path = require('path')
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(path.join(__dirname, '..', 'data', 'mydb.db'));

module.exports = function () {
    return {
        getResourceData( onErrorCallback, onSuccessCallback ) {
            db.all("SELECT resource_id AS id, name FROM resources", function(err, row) {
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
                //db.run("BEGIN");
                db.run("INSERT into resources (name) VALUES (?)", resource_data, function (e){
                    if (e) {
                        console.log(e);
                        onErrorCallback(e);
                        return
                    }
                    //console.log("val  "+this.lastID);
                    onSuccessCallback(this.lastID)

                });
                //db.run("END");
            });
        }
    }
}