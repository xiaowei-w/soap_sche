var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database('mydb.db');

db.serialize(function() {
    db.run('PRAGMA encoding="UTF-8"');
    var create_resource_table   = "CREATE TABLE if not exists resources ( "
    create_resource_table       += "resource_id INTEGER PRIMARY KEY AUTOINCREMENT, "
    create_resource_table       += "name CHAR(255) NOT NULL, "
    create_resource_table       += "toDelete INTEGER DEFAULT 0 )"
    
    db.run(create_resource_table);
    db.run("CREATE INDEX resources_delete_idx ON resources (toDelete )");

    //db.run("INSERT INTO resources VALUES ( ?, ?, 0 )", ['1', 'c166']);
    //db.run("INSERT INTO resources VALUES ( ?, ?, 0 )", ['2', 'c201']);
    
    var create_job_table    = "CREATE TABLE if not exists jobs ( "
    create_job_table        += "job_id INTEGER PRIMARY KEY AUTOINCREMENT, "
    create_job_table        += "name CHAR(255) NOT NULL, "
    create_job_table        += "resource_id INTEGER NOT NULL, "
    create_job_table        += "start_hr INTEGER NOT NULL, "
    create_job_table        += "start_min INTEGER NOT NULL, "
    create_job_table        += "start_dow CHAR(255) NOT NULL, "
    create_job_table        += "start_cmd CHAR(255) NOT NULL, "
    
    create_job_table        += "duration_hr INTEGER, "
    create_job_table        += "duration_min INTEGER, "
    create_job_table        += "end_cmd CHAR(255), "
    
    create_job_table        += "toDelete INTEGER DEFAULT 0 )"
    
    db.run(create_job_table);
    db.run("CREATE INDEX jobs_delete_idx ON jobs (toDelete)");

    // db.each("SELECT resource_id AS id, name, toDelete FROM resources", function(err, row) {
    //    console.log(row.id + ": " + row.name + " Delete:" + row.toDelete);
    // });
});

db.close();