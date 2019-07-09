import { passwordLength } from "../config/config";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/user";
import { generateReferentCode } from "../util/generateReferentCode";
import { generateUserId } from "../util/generateUserId";
import { generateAvatar } from "../util/generateAvatar";

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
 * POST /login
 * login user
 */
export const postLogin = (req: Request, res: Response, next: NextFunction) => {
  const inputEmail: string = req.body.email.toLowerCase();

  User.findOne({ email: inputEmail }, (err, userEmail) => {
    if (err) { return next(err); }
    if (userEmail) {
      console.log(`email ${inputEmail} is valid`);
    } else {
      res.render("account/login", {
        title: "login",
        error: "could not find your account",
        email: req.body.email
      });
    }
  })
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
  const { firstName, lastName, password, phone, address, passwordConfirm, referent } = req.body;
  const email: string = req.body.email.toLowerCase(); // lowercase email
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

  // create new user, generate user id and referent code
  const newUser = new User({
    id: generateUserId(),
    firstName: firstName,
    lastName: lastName,
    email: email,
    phone: phone,
    address: address,
    password: password,
    referent: generateReferentCode(firstName, lastName)
  });

  // find referent code in database
  User.findOne({ referent: referent }, (err, existingReferent) => {
    if (err) { return next(err); }
    if (existingReferent) {
      // find if email is already registered
      User.findOne({ email: email }, (err, existingUser) => {
        if (err) { return next(err); }
        if (existingUser) {
          errors.push("email is already registered");
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

        // save user in database
        newUser.save((err) => {
          if (err) { return next(err); }
          return res.redirect("/login");
        });
      });
    } else {
      errors.push("referent code does not exist");
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
  });
};

/**
 * GET /avatar/:id
 * Display user avatar as png image (based of user :id)
 */
export const getAvatar = (req: Request, res: Response) => {
  var size: number = 500;
  var avatar: Buffer = generateAvatar(req.params.id, size);
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': avatar.length
  });
  res.end(avatar);
};
