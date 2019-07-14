#!/usr/bin/env node

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

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
  if (err) throw err;
  var dbo = db.db("puffy-pocket");
  dbo.collection("users").insertOne(newUser, function(err, res) {
    if (err) throw err;
    console.log(newUser);
    console.log("1 document inserted");
    db.close();
  });
});
