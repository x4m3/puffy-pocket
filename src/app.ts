import express from "express";
import path from "path";
import mongoose, { Query } from "mongoose";
import errorHandler from "errorhandler";
import * as config from "./config/config";

// express app setup
var app = express();
app.locals.siteName = config.siteName;
if (config.status == "development") {
  app.locals.pretty = true;
  app.use(errorHandler());
}

// status monitor
app.use(
  require("express-status-monitor")({
    title: "status - " + config.siteName,
    theme: "default.css",
    path: "/status",
    spans: [{
      interval: 1, // Every second
      retention: 60 // Keep 60 data points in memory
    }, {
      interval: 5, // Every 5 seconds
      retention: 60
    }, {
      interval: 60, // Every minute
      retention: 60
    }],
    chartVisibility: {
      cpu: true,
      mem: true,
      load: true,
      responseTime: true,
      rps: false,
      statusCodes: true
    },
  })
);

// import controllers
import * as indexController from "./controllers/index";
import * as userController from "./controllers/user";

// database
var db: string = config.database;
mongoose.connect(db, {
  useNewUrlParser: true,
  useCreateIndex: true
}).then(() => console.log("connected to mongodb"))
  .catch(err => {
    console.error(err.name);
    console.error("check if the database is online, or check the path in config");
    console.log("exiting with error");
    process.exit(1);
  });

// view engine setup
app.set("port", config.port);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");

// express setup
app.use(require("morgan")("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// use public directory
app.use(express.static(path.join(__dirname, "../public")));

// routing
app.get("/", indexController.index);
app.get("/login", userController.getLogin);
app.post("/login", userController.postLogin);
app.get("/register", userController.getRegister);
app.post("/register", userController.postRegister);
app.get("/account/avatar/:id", userController.getAvatar);

// 404
app.use((req, res, next) => {
  res.status(404);
  res.render("404", {
    title: "404 error",
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
