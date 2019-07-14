#!/usr/bin/env node

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var database = "puffy-pocket";
var collection = "users";

var newUser = {
  userId: "00000000-0000-0000-0000-000000000000",
  email: "",
  password: "",
  info: {
    name: {
      first: "",
      last: ""
    },
    phone: "",
    address: "",
  },
  referral: {
    user: require("uuid/v4")(),
    registration: ""
  }
};

MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
  if (err) throw err;
  var dbo = db.db(database);
  dbo.collection(collection).insertOne(newUser, function(err, res) {
    if (err) {
      console.error(err.errmsg);
      process.exit(1);
    }
    console.log(newUser);
    console.log("1 document inserted");
    db.close();
  });
});
