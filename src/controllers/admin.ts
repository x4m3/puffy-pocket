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
    // TODO: add image (thumbnail + link to actual image from database)
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
 * GET /admin/product/image/:productId
 * Display product image from "productId"
 */
export const getProductImage = (req: Request, res: Response, next: NextFunction) => {
  // try to find in database the product
  Product.findOne({ productId: req.params.productId }, (err, product) => {
    if (err) { return next(err); }
    if (product) {
      // send the product image to client
      res.contentType(product.image.contentType);
      return res.send(product.image.data);
    }
    // if productId is invalid, return 404
    return next(err);
  });
};
