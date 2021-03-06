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
    return res.redirect("/");
  }
  res.render("public/login", {
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
      return res.render("public/login", {
        title: "login",
        error: info.message,
        email: req.body.email
      });
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      // if login succeeded
      res.redirect("/");
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
    return res.redirect("/");
  }
  res.render("public/register", {
    title: "register"
  });
};

/**
 * POST /register
 * register new user
 */
export const postRegister = (req: Request, res: Response, next: NextFunction) => {
  const firstName:        string = req.body.firstName;
  const lastName:         string = req.body.lastName;
  const password:         string = req.body.password;
  const passwordConfirm:  string = req.body.passwordConfirm;
  const phone:            string = req.body.phone;
  const street:           string = req.body.street;
  const streetComplement: string = req.body.streetComplement;
  const postalCode:       string = req.body.postalCode;
  const city:             string = req.body.city;
  const referral:         string = req.body.referral;
  const email:            string = req.body.email;

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

  // postal code check
  if (!postalCode.match(/^[0-9]{5}$/)) {
    errors.push("invalid postal code");
  }

  // city name check
  if (!city.match(/^([a-zA-Z\u0080-\u024F]+(?:. |-| |'))*[a-zA-Z\u0080-\u024F]*$/)) {
    errors.push("invalid city");
  }

  // only capital letters and numbers for referral
  if (!referral.match(/[A-Z0-9]+/)) {
    errors.push("referral code format doesn't match");
  }

  if (errors.length > 0) {
    return res.render("public/register", {
      title: "register",
      errors,
      firstName,
      lastName,
      email,
      phone,
      street,
      streetComplement,
      postalCode,
      city,
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
          return res.render("public/register", {
            title: "register",
            errors,
            firstName,
            lastName,
            email,
            phone,
            street,
            streetComplement,
            postalCode,
            city,
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
            address: {
              street: street,
              streetComplement: streetComplement,
              postalCode: +postalCode,
              city: city
            },
            phone: phone
          },
          referral: {
            user: generateReferralCode(firstName, lastName, 3),
            registration: referral
          },
          admin: false
        });

        // first user to register has to be admin and doesn't have a registration referral code
        if (existingReferral.firstUser == true) {
          newUser.admin = true;
          newUser.referral.registration = "";
        }

        // save new user in database
        newUser.save((err) => {
          if (err) { return next(err); }

          // delete firstUser, now that there is a real user with admin privileges
          if (existingReferral.firstUser == true) {
            existingReferral.remove((err, removedFirstUser) => {
              if (err) { return next(err); }
            });
          }

          // login new user
          passport.authenticate("local", (err: Error, user: UserDocument, info: IVerifyOptions) => {
            if (err) { return next(err); }
            req.logIn(user, (err) => {
              if (err) { return next(err); }
              res.redirect("/");
            });
          })(req, res, next);
        });
      });
    } else {
      errors.push("referral code does not exist");
      return res.render("public/register", {
        title: "register",
        errors,
        firstName,
        lastName,
        email,
        phone,
        street,
        streetComplement,
        postalCode,
        city,
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
