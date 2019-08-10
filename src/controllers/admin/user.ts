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
  const firstName: string = req.body.firstName;
  const lastName: string = req.body.lastName;
  const password: string = req.body.password;
  const passwordConfirm: string = req.body.passwordConfirm;
  const phone: string = req.body.phone;
  const address: string = req.body.address;
  const email: string = req.body.email;
  const admin: boolean = (req.body.admin == "true") ? true : false;

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

  if (errors.length > 0) {
    return res.render("admin/user-add", {
      title: "add user - admin panel",
      user: req.user,
      errors,
      firstName,
      lastName,
      email,
      phone,
      address
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
        address
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
          phone: phone,
          address: address
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
        address: user.info.address,
        admin: user.admin
      })
    }
    // if userId is invalid, return 404
    return next(err);
  });
};

/**
 * POST /admin/users/edit/:userId
 * Edit user information from "userId"
 */
export const postUserEdit = (req: Request, res: Response, next: NextFunction) => {
  let firstName: string = req.body.firstName;
  let lastName: string = req.body.lastName;
  let email: string = req.body.email;
  let phone: string = req.body.phone;
  let address: string = req.body.address;
  let admin: boolean = (req.body.admin) == "true" ? true : false;

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

  if (errors.length > 0) {
    // render page again with user info and error messages
    return res.redirect("/admin/users/edit/" + req.params.userId);
  }

  // find if new email address is already registered
  User.findOne({ email: email }, (err, registeredEmail) => {
    if (err) { return next(err); }

    // if the email is already registered
    if (registeredEmail) {
      return res.redirect("/admin/users/edit/" + req.params.userId);
    } else {
      // find user in database
      User.findOne({ userId: req.params.userId }, (err, user) => {
        if (err) { return next(err); }
        if (user) {
          // update user info if they have changed
          if (firstName.length != 0) { user.info.name.first = firstName; }
          if (lastName.length != 0) { user.info.name.last = lastName; }
          if (email.length != 0) { user.email = email; }
          if (phone.length != 0) { user.info.phone = phone; }
          if (address.length != 0) { user.info.address = address; }

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
          })
        }
      });
    }
  });
};
