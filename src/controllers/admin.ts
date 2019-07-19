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
  const newProduct: ProductDocument = new Product({
    productId: generateProductId(),
    name: req.body.name,
    price: req.body.price,
    points: req.body.points
  });

  newProduct.save((err) => {
    if (err) { return next(err); }
    console.log("new product saved");
  });
};
