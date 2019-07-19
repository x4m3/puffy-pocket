import * as fs from "fs";
import { Request, Response, NextFunction } from "express";
import { Product, ProductDocument } from "../models/product";
import { generateProductId } from "../util/generateProductId";

/**
 * GET /admin
 * Display main admin page
 */
export const getAdmin = (req: Request, res: Response, next: NextFunction) => {
  res.render("admin", {
    title: "admin panel"
  });
};

export const postAdminAddItem = (req: Request, res: Response, next: NextFunction) => {
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
