var config = require('../config/config');
var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');

// user model
var User = require('../models/user');

// main auth page
router.get('/', (req, res, next) => {
  res.render('auth', { title: "authentication"});
});

// login page
router.get('/login', (req, res, next) => {
  res.render('login', { title: "login" });
});

// register page
router.get('/register', (req, res, next) => {
  res.render('register', { title: "register" });
});

// if register form is sent
router.post('/register', (req, res) => {
  const { firstName, lastName, email, phone, address, password, passwordConfirm, referent } = req.body;
  let errors = [];

  // check if firstName and lastName contain only letters
  if (!firstName.match(/^[A-Z]+(([' -][a-zA-Z ])?[a-zA-Z]*)*$/) || !lastName.match(/^[A-Z]+(([' -][a-zA-Z ])?[a-zA-Z]*)*$/)) {
    errors.push({ msg: `only letters are allowed for name` });
  }

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
      title: "register",
      errors,
      firstName,
      lastName,
      email,
      phone,
      address,
      referent
    });
  }

  // validation passed, ready to store in database
  else {
    // find if referent code exists
    User.findOne({ referent: referent })
      .then(user => {
        if (user) {
          // find if email is alread registered
          User.findOne({ email: email })
            .then(user => {
              if (user) {
                // if email already exists, render page with error message
                errors.push({ msg: "email is already registered" });
                res.render('register', {
                  title: "register",
                  errors,
                  firstName,
                  lastName,
                  email,
                  phone,
                  address,
                  referent
                });
              } else {
                // create user
                var newUser = new User({
                  // TODO: check if id already exists in database
                  id: require('uuid/v4')(),
                  firstName,
                  lastName,
                  email,
                  phone,
                  address,
                  password,
                  referent: require('../util/generateReferentCode')(firstName, lastName, 3)
                });

                // generate salt and hash password
                bcrypt.genSalt(10, (err, salt) =>
                  bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    // store hashed password
                    newUser.password = hash;
                    // save new user and redirect to login page
                    newUser.save()
                      .then(user => { res.redirect('/auth/login') })
                      .catch(err => console.error(err));
                  }));
              }
            });
        } else {
          // referent code couldn't be found, render page with error message
          errors.push({ msg: "referent code does not exist" });
          res.render('register', {
            title: "register",
            errors,
            firstName,
            lastName,
            email,
            phone,
            address,
            referent
          });
        }
      });
  }
});

module.exports = router;