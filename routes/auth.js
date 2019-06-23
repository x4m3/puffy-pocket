var config = require('../config/config');
var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');

// user model
var User = require('../models/user');

// main auth page
router.get('/', (req, res, next) => {
  res.render('auth');
});

// login page
router.get('/login', (req, res, next) => {
  res.render('login');
});

// register page
router.get('/register', (req, res, next) => {
  res.render('register');
});

// if register form is sent
router.post('/register', (req, res) => {
  const { name, email, password, passwordConfirm, referent } = req.body;
  let errors = [];

  // check if password is at least long enough (see config file)
  if (password.length < config.passwordLength) {
    errors.push({ msg: `password must be at least ${config.passwordLength} characters` });
  }

  // check if passwords match
  else if (password != passwordConfirm) {
    errors.push({ msg: "passwords don't match" });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      referent
    });
  }

  // validation passed, ready to store in database
  else {
    // try to find email in database
    User.findOne({ email: email })
    .then(user => {
      // if user already exists
      if (user) {
        errors.push({ msg: "email is already registered" });
        res.render('register', {
          errors,
          name,
          email,
          referent
        });
      } else {
        // create user
        var newUser = new User({
          id: require('uuid/v4')(),
          name,
          email,
          password,
          referent
        });

        // generate salt and hash password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            // store hashed password
            newUser.password = hash;
            // save new user
            newUser.save()
              .then(user => { res.redirect('/auth/login') })
              .catch(err => console.error(err));
        }));
      }
    });
  }
});

module.exports = router;
