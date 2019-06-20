var config = require('./config/config');
var express = require('express');
var path = require('path');

// setup app and website title variable
var app = express();
app.locals.siteName = config.siteName;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// express setup
app.use(require('morgan')('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// use public directory
app.use(express.static(path.join(__dirname, 'public')));

// routing
app.use('/', require('./routes/index'));

// 404
app.use(function(req, res, next) {
  res.status(404);
  res.render('error', {
    title: 'error',
    code: 404,
    status: 'not found',
    url: req.url
  });
});

// 500
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500);
  res.render('error', {
    title: 'error',
    code: 500,
    status: err.message,
    url: req.url
  });
});

// start server
var server = app.listen(config.port, function() {
  console.log(`${config.siteName} running on port ${config.port} in ${config.status} mode`);
});

module.exports = app;
