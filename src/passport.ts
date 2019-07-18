import passport from "passport";
import passportLocal from "passport-local";

import { User } from "./models/user";
import { Request, Response, NextFunction } from "express";

const LocalStrategy = passportLocal.Strategy;

passport.serializeUser<any, any>((user, done) => {
  done(undefined, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
  // find the email in the database
  User.findOne({ email: email.toLowerCase() }, (err, user: any) => {
    if (err) { return done(err); }
    if (!user) {
      // could not find user's email
      return done(undefined, false, { message: "could not find your account." });
    }
    user.comparePassword(password, (err: Error, isMatch: boolean) => {
      if (err) { return done(err); }
      if (isMatch) {
        // success, return the user
        return done(undefined, user);
      }
      // could not match password
      return done(undefined, false, { message: "invalid password." });
    });
  });
}));

/**
 * Login Required middleware.
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user.admin === true) {
    return next();
  }
  res.status(403);
  res.render("4xx/403", {
    title: "403 error",
    url: req.url
  });
};
