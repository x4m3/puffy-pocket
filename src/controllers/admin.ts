import * as fs from "fs";
import { Request, Response, NextFunction } from "express";
import { Product, ProductDocument } from "../models/product";
import { User } from "../models/user";
import { generateProductId } from "../util/generateProductId";
import { checkFileImage } from "../util/checkFileImage";

/**
 * GET /admin
 * Display main admin page
 */
export const getIndex = (req: Request, res: Response, next: NextFunction) => {
  res.render("admin/index", {
    title: "admin panel"
  });
};

/**
 * GET /admin/products
 * Display products page
 */
export const getProducts = (req: Request, res: Response, next: NextFunction) => {
  type productData = {
    productId: string;
    available: string;
    name: string;
    price: number;
    points: number;
  };
  let productList: Array<productData> = [];

  Product.find({}, (err, products) => {
    if (err) { return next(err); }
    products.forEach((product) => {
      productList.push({
        productId: product.productId,
        available: (product.available) ? "yes" : "no",
        name: product.name,
        price: product.price,
        points: product.points
      });
    });
    res.render("admin/products", {
      title: "products - admin panel",
      products: productList
    });
  });
};

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
        phone: user.info.phone,
        admin: (user.admin) ? "yes" : "no",
        points: user.points,
        referral: user.referral.user
      });
    });
    res.render("admin/users", {
      title: "users - admin panel",
      users: userList
    });
  });
};

/**
 * POST /admin/products/add
 * Add new product to database
 */
export const postProductsAdd = (req: Request, res: Response, next: NextFunction) => {
  // if uploaded file is not an image
  if (checkFileImage(req.files.image.name) == false) {
    // delete uploaded file from filesystem
    fs.unlink(req.files.image.path, (err) => {
      if (err) throw err;
    });

    // redirect back to the products page
    return res.redirect("/admin/products");
  }

  const newProduct: ProductDocument = new Product({
    productId: generateProductId(),
    name: <string>req.fields.name, // need to cast to string
    price: +req.fields.price, // "+" means to store as "number"
    points: +req.fields.points, // "+" means to store as "number"
    image: {
      data: fs.readFileSync(req.files.image.path),
      contentType: req.files.image.type
    },
    available: true
  });

  newProduct.save((err) => {
    if (err) { return next(err); }

    // delete uploaded file from filesystem
    fs.unlink(req.files.image.path, (err) => {
      if (err) throw err;
    });

    // redirect back to the products page
    return res.redirect("/admin/products");
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

/**
 * GET /admin/products/delete/:productId
 * Delete product from "productId"
 */
export const getProductDelete = (req: Request, res: Response, next: NextFunction) => {
  // find product via productId in database
  Product.findOne({ productId: req.params.productId }, (err, productToDelete) => {
    if (err) { return next(err); }
    if (productToDelete) {
      // delete product
      productToDelete.remove((err, removedProduct) => {
        if (err) { return next(err); }

        // redirect back to the products page
        return res.redirect("/admin/products");
      });
    } else {
      // if productId is invalid, return 404
      return next(err);
    }
  });
};
