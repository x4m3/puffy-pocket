import { passwordLength } from "../config/config";
import { Request, Response, NextFunction } from "express";
import { User, UserDocument } from "../models/user";
import { generateReferralCode } from "../util/generateReferralCode";
import { generateUserId } from "../util/generateUserId";
import { IVerifyOptions } from "passport-local";
import passport from "passport";
import "../passport";

/**
 * GET /login
 * login page
 */
export const getLogin = (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    // if user is already logged in
    return res.redirect("/account");
  }
  res.render("login", {
    title: "login"
  });
};

/**
 * POST /login
 * login user
 */
export const postLogin = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", (err: Error, user: UserDocument, info: IVerifyOptions) => {
    if (err) { return next(err); }
    if (!user) {
      // if login failed
      return res.render("login", {
        title: "login",
        error: info.message,
        email: req.body.email
      });
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      // if login succeeded
      res.redirect(req.session.returnTo || "/account");
    });
  })(req, res, next);
};

/**
 * GET /register
 * register page
 */
export const getRegister = (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    // if user is already logged in
    return res.redirect("/account");
  }
  res.render("register", {
    title: "register"
  });
};

/**
 * POST /register
 * register new user
 */
export const postRegister = (req: Request, res: Response, next: NextFunction) => {
  const firstName:       string = <string>req.fields.firstName;
  const lastName:        string = <string>req.fields.lastName;
  const password:        string = <string>req.fields.password;
  const passwordConfirm: string = <string>req.fields.passwordConfirm;
  const phone:           string = <string>req.fields.phone;
  const address:         string = <string>req.fields.address;
  const referral:        string = <string>req.fields.referral;
  const email:           string = <string>req.fields.email;

  let errors: Array<string> = [];

  // valid name and last name
  if (!firstName.match(/^[A-Z]+(([' -][a-zA-Z ])?[a-zA-Z]*)*$/) || !lastName.match(/^[A-Z]+(([' -][a-zA-Z ])?[a-zA-Z]*)*$/)) {
    errors.push("only letters are allowed for name");
  }

  // phone number formatting
  if (!phone.match(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/)) {
    errors.push("invalid phone number");
  }

  // password length and matching passwords
  if (password.length < passwordLength) {
    errors.push(`password must be at least ${passwordLength} characters`);
  }
  else if (password != passwordConfirm) {
    errors.push("passwords don't match");
  }

  // only capital letters and numbers for referral
  if (!referral.match(/[A-Z0-9]+/)) {
    errors.push("referral code format doesn't match");
  }

  if (errors.length > 0) {
    return res.render("register", {
      title: "register",
      errors,
      firstName,
      lastName,
      email,
      phone,
      address,
      referral
    });
  }

  // find referral code in database
  User.findOne({ "referral.user" : referral }, (err, existingReferral) => {
    if (err) { return next(err); }
    if (existingReferral) {
      // find if email is already registered
      User.findOne({ email: email.toLowerCase() }, (err, existingUser) => {
        if (err) { return next(err); }
        if (existingUser) {
          errors.push("email is already registered");
          return res.render("register", {
            title: "register",
            errors,
            firstName,
            lastName,
            email,
            phone,
            address,
            referral
          });
        }

        // create new user, generate user id and referral code
        const newUser: UserDocument = new User({
          userId: generateUserId(),
          email: email.toLowerCase(),
          password: password,
          points: 0,
          info: {
            name: {
              first: firstName,
              last: lastName
            },
            phone: phone,
            address: address,
          },
          referral: {
            user: generateReferralCode(referral, firstName, lastName, 3),
            registration: referral
          }
        });

        // save new user in database
        newUser.save((err) => {
          if (err) { return next(err); }

          // login new user
          passport.authenticate("local", (err: Error, user: UserDocument, info: IVerifyOptions) => {
            if (err) { return next(err); }
            req.logIn(user, (err) => {
              if (err) { return next(err); }
              res.redirect(req.session.returnTo || "/account");
            });
          })(req, res, next);
        });
      });
    } else {
      errors.push("referral code does not exist");
      return res.render("register", {
        title: "register",
        errors,
        firstName,
        lastName,
        email,
        phone,
        address,
        referral
      });
    }
  });
};

/**
 * GET /logout
 * Logout user
 */
export const getLogout = (req: Request, res: Response) => {
  req.logOut();
  res.redirect("/");
}
