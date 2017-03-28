var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database('mydb.db');

db.serialize(function() {
    db.run("CREATE TABLE if not exists resources (resource_id INTEGER PRIMARY_KEY UNIQUE, name TEXT NOT NULL )");
    
    db.run("INSERT INTO resources VALUES ( ?, ? )", ['1', 'c166']);
    db.run("INSERT INTO resources VALUES ( ?, ? )", ['2', 'c201'] );

    db.each("SELECT resource_id AS id, name FROM resources", function(err, row) {
        console.log(row.id + ": " + row.name);
    });
});

db.close();