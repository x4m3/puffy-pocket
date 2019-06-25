var config = require('./config/config');
var express = require('express');
var path = require('path');
var mongoose = require('mongoose');

// setup app and local variables
var app = express();
app.locals.siteName = config.siteName;
if (config.status == 'development') {
  app.locals.pretty = true;
}

// database
var db = config.database;
mongoose.connect(db, { useNewUrlParser: true })
  .then(() => console.log('connected to mongodb'))
  .catch(err => console.log(err));

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
app.use('/auth', require('./routes/auth'));

// 404
app.use(function(req, res, next) {
  res.status(404);
  res.render('404', {
    title: 'error',
    url: req.url
  });
});

// 500
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500);
  res.render('error', {
    title: 'error',
    httpCode: err.status || 500,
    error: err,
    time: Date()
  });
});

// start server
var server = app.listen(config.port, function() {
  console.log(`${config.siteName} running on port ${config.port} in ${config.status} mode`);
});

module.exports = app;
