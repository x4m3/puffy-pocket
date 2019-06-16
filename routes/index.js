var config = require('../config/config');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { config: config , title: config.siteName});
});

module.exports = router;
