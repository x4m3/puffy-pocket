var config = require('../config/config');
var express = require('express');
var router = express.Router();

var pageTitle = "login / register";

router.get('/', function(req, res, next) {
  res.render('auth', { title: pageTitle });
});

// if register form is sent
router.post('/register', (req, res) => {
  const { name, email, password, passwordConfirm, referent } = req.body;
  let errors = [];

  if (password != passwordConfirm) {
    errors.push({ msg: "passwords don't match" });
  }

  if (password.length < config.passwordLength) {
    errors.push({ msg: `password must be at least ${config.passwordLength} characters` });
  }

  if (errors.length > 0) {
    res.render('auth', { title: pageTitle });
  }
});

module.exports = router;
