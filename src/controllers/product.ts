import { Request, Response, NextFunction } from "express";
import { Product } from "../models/product";

/**
 * GET /products/:productId/image
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
