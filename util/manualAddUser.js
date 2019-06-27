var bcrypt = require('bcryptjs');

// user model
var User = require('../models/user');

module.exports = function () {
  var newUser = new User({
    id: require('uuid/v4')(),
    firstName: "James",
    lastName: "Smith",
    email: "james.smith@example.net",
    phone: "+1 206 555 010",
    address: "1 Infinite Loop, Cupertino, CA 95014 USA",
    password: "hellopassword",
    referent: "JS001"
  });

  // generate salt and hash password
  bcrypt.genSalt(10, (err, salt) =>
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      // store hashed password
      newUser.password = hash;
      // save new user
      newUser.save()
        .then(user => { console.log(`user ${user} created`) })
        .catch(err => console.error(err));
    }));
};
