import { Request, Response, NextFunction } from "express";
import { User } from "../../models/user";

/**
 * GET /admin/users
 * Display users page
 */
export const getUsers = (req: Request, res: Response, next: NextFunction) => {
  type userData = {
    userId: string;
    email: string;
    name: string;
    phone: string;
    admin: string;
    points: number;
    referral: {
      user: string;
      registration: string;
    }
  };
  let userList: Array<userData> = [];

  User.find({}, (err, users) => {
    if (err) { return next(err); }
    users.forEach((user) => {
      userList.push({
        userId: user.userId,
        email: user.email,
        name: user.info.name.first + " " + user.info.name.last,
        phone: user.info.phone,
        admin: (user.admin) ? "yes" : "no",
        points: user.points,
        referral: {
          user: user.referral.user,
          registration: user.referral.registration
        }
      });
    });
    res.render("admin/users", {
      title: "users - admin panel",
      users: userList,
      currentUser: req.user.userId
    });
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

      // change admin status
      if (admin == true && user.admin == false) { user.admin = true; }
      if (admin == false && user.admin == true) { user.admin = false; }

      // save changes in database
      user.save((err) => {
        if (err) { return next(err); }

        // redirect back to the users page
        return res.redirect("/admin/users");
      })
    }
  });
};
