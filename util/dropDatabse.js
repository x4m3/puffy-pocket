#!/usr/bin/env node

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var database = "puffy-pocket";

MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
  if (err) throw err;
  var dbo = db.db(database);
  dbo.dropDatabase(function(err, res) {
    if (err) {
      console.error(err.errmsg);
      process.exit(1);
    }
    console.log("database deleted");
    db.close();
  });
});
