import express from "express";
import path from "path";
import mongoose from "mongoose";
import errorHandler from "errorhandler";
import * as config from "./config/config";

// express app setup
var app = express();
app.locals.siteName = config.siteName;
if (config.status == 'development') {
  app.locals.pretty = true;
  app.use(errorHandler());
}

// database
var db: string = config.database;
mongoose.connect(db, { useNewUrlParser: true })
  .then(() => console.log('connected to mongodb'))
  .catch(err => {
    console.error(err.name);
    console.error("check if the database is online, or check the path in config");
    console.log("exiting with error");
    process.exit(1);
  });

// view engine setup
app.set("port", config.port);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

// express setup
app.use(require('morgan')('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// use public directory
app.use(express.static(path.join(__dirname, '../public')));

// routing
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));

// 404
app.use((req, res, next) => {
  res.status(404);
  res.render('404', {
    title: 'error',
    url: req.url
  });
  next();
})

// start server
app.listen(config.port, () => {
  console.log(`  App is running at http://localhost:${config.port} in ${config.status} mode`);
  console.log("  Press CTRL-C to stop\n");
});

export default app;
