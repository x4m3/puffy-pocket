import { passwordLength } from "../config/config";
import { User } from "../models/user";
import { Request, Response, NextFunction } from "express";
import { generateReferentCode } from "../util/generateReferentCode";
import bcrypt from "bcryptjs";
import uuid from "uuid/v4";

/**
 * GET /login
 * login page
 */
export const getLogin = (req: Request, res: Response) => {
  res.render("account/login", {
    title: "login"
  });
};

/**
 * GET /register
 * register page
 */
export const getRegister = (req: Request, res: Response) => {
  res.render("account/register", {
    title: "register"
  });
};

/**
 * POST /register
 * register new user
 */
export const postRegister = (req: Request, res: Response, next: NextFunction) => {
  const { firstName, lastName, email, phone, address, password, passwordConfirm, referent } = req.body;
  let errors: Array<string> = [];

  // valid name and last name
  if (!firstName.match(/^[A-Z]+(([' -][a-zA-Z ])?[a-zA-Z]*)*$/) || !lastName.match(/^[A-Z]+(([' -][a-zA-Z ])?[a-zA-Z]*)*$/)) {
    errors.push("only letters are allowed for name");
  }

  // phone number formatting
  if (!phone.match(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/)) {
    errors.push("invalid phone number");
  }

  if (password.length < passwordLength) {
    errors.push(`password must be at least ${passwordLength} characters`);
  }
  else if (password != passwordConfirm) {
    errors.push("passwords don't match");
  }

  // only capital letters and numbers for referent
  if (!referent.match(/[A-Z0-9]+/)) {
    errors.push("referent code format doesn't match");
  }

  if (errors.length > 0) {
    return res.render("account/register", {
      title: "register",
      errors,
      firstName,
      lastName,
      email,
      phone,
      address,
      referent
    });
  }

  // validation passed, ready to store in database
  else {
    // find if referent code exists
    User.findOne({ referent: referent })
      .then(user => {
        if (user) {
          // find if email is already registered
          User.findOne({ email: email })
            .then(user => {
              if (user) {
                // if email already exists, render page with error message
                errors.push("email is already registered");
                res.render("account/register", {
                  title: "register",
                  errors,
                  firstName,
                  lastName,
                  email,
                  phone,
                  address,
                  referent
                });
              } else {
                // create user
                var newUser = new User({
                  // TODO: check if id already exists in database
                  id: uuid(),
                  firstName,
                  lastName,
                  email,
                  phone,
                  address,
                  password,
                  referent: generateReferentCode(firstName, lastName)
                });

                // generate salt and hash password
                // TODO: move password encryption to models/user.ts (see microsoft template)
                bcrypt.genSalt(10, (err, salt) =>
                  bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    // store hashed password
                    newUser.password = hash;
                    // save new user and redirect to login page
                    newUser.save()
                      .then(user => { res.redirect('/auth/login') })
                      .catch(err => console.error(err));
                  }));
              }
            });
        } else {
          // referent code couldn't be found, render page with error message
          errors.push("referent code does not exist");
          res.render("account/register", {
            title: "register",
            errors,
            firstName,
            lastName,
            email,
            phone,
            address,
            referent
          });
        }
      });
  }
};
