import express, { Request, Response, NextFunction } from "express";
import path from "path";
import mongoose, { Query } from "mongoose";
import errorHandler from "errorhandler";
import session from "express-session";
import passport from "passport";
import mongo from "connect-mongo";
import ExpressFormidable from "express-formidable";
import * as config from "./config/config";

const MongoStore = mongo(session);

// express app setup
var app = express();
app.locals.siteName = config.siteName;
app.locals.passwordLength = config.passwordLength;
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
import * as accountController from "./controllers/account";
import * as adminController from "./controllers/admin";
import { isAuthenticated, isAdmin } from "./passport";

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

// express session
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.secret,
  store: new MongoStore({
    url: config.database,
    autoReconnect: true
  })
}));

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

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
app.get("/logout", isAuthenticated, userController.getLogout);
app.get("/register", userController.getRegister);
app.post("/register", userController.postRegister);
app.get("/account", isAuthenticated, accountController.getAccount);
app.get("/account/avatar", isAuthenticated, accountController.getAvatar);
app.get("/admin", isAuthenticated, isAdmin, adminController.getIndex);
app.get("/admin/products", isAuthenticated, isAdmin, adminController.getProducts);
app.post("/admin/products/add", ExpressFormidable({ hash: "sha1" }), adminController.postProductsAdd);
app.get("/admin/users", isAuthenticated, isAdmin, adminController.getUsers);

// 404
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404);
  res.render("4xx/404", {
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
