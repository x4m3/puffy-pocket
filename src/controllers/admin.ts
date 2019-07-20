import * as fs from "fs";
import { Request, Response, NextFunction } from "express";
import { Product, ProductDocument } from "../models/product";
import { User } from "../models/user";
import { generateProductId } from "../util/generateProductId";

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
  res.render("admin/products", {
    title: "products - admin panel"
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
        points: user.points
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
  // TODO: check if uploaded file is an image

  const newProduct: ProductDocument = new Product({
    productId: generateProductId(),
    name: <string>req.fields.name, // need to cast to string
    price: +req.fields.price, // "+" means to store as "number"
    points: +req.fields.points, // "+" means to store as "number"
    image: {
      data: fs.readFileSync(req.files.image.path),
      contentType: req.files.image.type
    }
  });

  newProduct.save((err) => {
    if (err) { return next(err); }
    console.log("new product saved");
    res.contentType(newProduct.image.contentType);
    res.send(newProduct.image.data);
  });
};
