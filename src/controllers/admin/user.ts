import { Request, Response, NextFunction } from "express";
import { User, UserDocument } from "../../models/user";
import { passwordLength } from "../../config/config";
import { generateUserId } from "../../util/generateUserId";
import { generateReferralCode } from "../../util/generateReferralCode";

/**
 * GET /admin/users
 * Display users page
 */
export const getUsers = (req: Request, res: Response, next: NextFunction) => {
  type userData = {
    userId: string;
    email: string;
    name: string;
    admin: string;
    points: number;
    referral: string;
  };
  let userList: Array<userData> = [];

  User.find({}, (err, users) => {
    if (err) { return next(err); }
    users.forEach((user) => {
      userList.push({
        userId: user.userId,
        email: user.email,
        name: user.info.name.first + " " + user.info.name.last,
        admin: (user.admin) ? "yes" : "no",
        points: user.points,
        referral: user.referral.user
      });
    });
    res.render("admin/users", {
      title: "users - admin panel",
      user: req.user,
      users: userList,
      currentUser: req.user.userId
    });
  });
};

/**
 * GET /admin/users/add
 * Manually add new user
 */
export const getUserAdd = (req: Request, res: Response, next: NextFunction) => {
  return res.render("admin/user-add", {
    title: "add user - admin panel",
    user: req.user
  });
}

/**
 * POST /admin/users/add
 * Manually add new user
 */
export const postUserAdd = (req: Request, res: Response, next: NextFunction) => {
  const firstName:        string  = req.body.firstName;
  const lastName:         string  = req.body.lastName;
  const password:         string  = req.body.password;
  const passwordConfirm:  string  = req.body.passwordConfirm;
  const phone:            string  = req.body.phone;
  const street:           string  = req.body.street;
  const streetComplement: string  = req.body.streetComplement;
  const postalCode:       string  = req.body.postalCode;
  const city:             string  = req.body.city;
  const email:            string  = req.body.email;
  const admin:            boolean = (req.body.admin == "true") ? true : false;

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

  if (errors.length > 0) {
    return res.render("admin/user-add", {
      title: "add user - admin panel",
      user: req.user,
      errors,
      firstName,
      lastName,
      email,
      phone,
      street,
      streetComplement,
      postalCode,
      city
    });
  }

  // check if email is already registered
  User.findOne({ email: email.toLowerCase() }, (err, existingUser) => {
    if (err) { return next(err); }
    if (existingUser) {
      // email is already registered, render page with error
      errors.push("email address is already registered");
      return res.render("admin/user-add", {
        title: "add user - admin panel",
        user: req.user,
        errors,
        firstName,
        lastName,
        email,
        phone,
        street,
        streetComplement,
        postalCode,
        city
      });
    } else {
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
          user: generateReferralCode(firstName, lastName, 3)
        },
        admin: admin
      });

      newUser.save((err) => {
        if (err) { return next(err); }

        // registration succeeded, go back to list of users
        return res.redirect("/admin/users");
      });
    }
  });
};

/**
 * GET /admin/users/delete/:userId
 * Delete user from "userId"
 */
export const getUserDelete = (req: Request, res: Response, next: NextFunction) => {
  // find user via userId in database
  User.findOne({ userId: req.params.userId }, (err, userToDelete) => {
    if (err) { return next(err); }
    if (userToDelete) {
      // delete user
      userToDelete.remove((err, removedUser) => {
        if (err) { return next(err); }

        // redirect back to the users page
        return res.redirect("/admin/users");
      });
    } else {
      // if userId is invalid, return 404
      return next(err);
    }
  });
};

/**
 * GET /admin/users/edit/:userId
 * Display edit user information from "userId"
 */
export const getUserEdit = (req: Request, res: Response, next: NextFunction) => {
  // try to find user in database
  User.findOne({ userId: req.params.userId}, (err, user) => {
    if (err) { return next(err); }
    if (user) {
      return res.render("admin/user-edit", {
        title: "edit user - admin panel",
        user: req.user,
        currentUser: req.user.userId,
        userId: user.userId,
        firstName: user.info.name.first,
        lastName: user.info.name.last,
        email: user.email,
        phone: user.info.phone,
        street: user.info.address.street,
        streetComplement: user.info.address.streetComplement,
        postalCode: user.info.address.postalCode,
        city: user.info.address.city,
        admin: user.admin
      });
    } else {
      // if userId is invalid, return 404
      return next(err);
    }
  });
};

/**
 * POST /admin/users/edit/:userId
 * Edit user information from "userId"
 */
export const postUserEdit = (req: Request, res: Response, next: NextFunction) => {
  const firstName:        string  = req.body.firstName;
  const lastName:         string  = req.body.lastName;
  const phone:            string  = req.body.phone;
  const street:           string  = req.body.street;
  const streetComplement: string  = req.body.streetComplement;
  const postalCode:       string  = req.body.postalCode;
  const city:             string  = req.body.city;
  const email:            string  = req.body.email;
  const admin:            boolean = (req.body.admin == "true") ? true : false;

  let errors: Array<string> = [];

  if (firstName.length != 0 && !firstName.match(/^[A-Z]+(([' -][a-zA-Z ])?[a-zA-Z]*)*$/)) {
    errors.push("only letters are allowed for name");
  }
  if (lastName.length != 0 && !lastName.match(/^[A-Z]+(([' -][a-zA-Z ])?[a-zA-Z]*)*$/)) {
    errors.push("only letters are allowed for name");
  }

  if (phone.length != 0 && !phone.match(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/)) {
    errors.push("invalid phone number");
  }

  // postal code check
  if (postalCode.length != 0 && !postalCode.match(/^[0-9]{5}$/)) {
    errors.push("invalid postal code");
  }

  // city name check
  if (city.length != 0 && !city.match(/^([a-zA-Z\u0080-\u024F]+(?:. |-| |'))*[a-zA-Z\u0080-\u024F]*$/)) {
    errors.push("invalid city");
  }

  // find if new email address is already registered
  User.findOne({ email: email }, (err, registeredEmail) => {
    if (err) { return next(err); }
    if (registeredEmail) {
      // if the email is already registered
      errors.push("Email address is already registered");
    }
    // find user in database
    User.findOne({ userId: req.params.userId }, (err, user) => {
      if (err) { return next(err); }
      if (user) {
        if (errors.length > 0) {
          // render page again with user info and error messages
          return res.render("admin/user-edit", {
            title: "edit user - admin panel",
            user: req.user,
            currentUser: req.user.userId,
            userId: user.userId,
            errors: errors,
            firstName: user.info.name.first,
            lastName: user.info.name.last,
            email: user.email,
            phone: user.info.phone,
            street: user.info.address.street,
            streetComplement: user.info.address.streetComplement,
            postalCode: user.info.address.postalCode,
            city: user.info.address.city,
            admin: user.admin
          });
        }

        // update user info if input value is not empty
        if (firstName.length != 0) { user.info.name.first = firstName; }
        if (lastName.length != 0) { user.info.name.last = lastName; }
        if (email.length != 0) { user.email = email; }
        if (phone.length != 0) { user.info.phone = phone; }
        if (street.length != 0) { user.info.address.street = street; }
        if (streetComplement.length != 0) { user.info.address.streetComplement = streetComplement; }
        if (postalCode.length != 0 && +postalCode != user.info.address.postalCode) { user.info.address.postalCode = +postalCode; }

        // change admin status only if the current userId is different than the userId to change
        if (req.user.userId != req.params.userId) {
          if (admin == true && user.admin == false) { user.admin = true; }
          if (admin == false && user.admin == true) { user.admin = false; }
        }

        // save changes in database
        user.save((err) => {
          if (err) { return next(err); }

          // redirect back to the users page
          return res.redirect("/admin/users");
        });
      } else {
        return next(err);
      }
    });
  });
};
