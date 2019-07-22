import { Request, Response, NextFunction } from "express";
import { Product } from "../models/product";
import Sharp from "sharp";

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

/**
 * GET /products/:productId/thumbnail
 * Display product thumbnail image from "productId"
 */
export const getProductThumbnail = (req: Request, res: Response, next: NextFunction) => {
  // try to find in database the product
  Product.findOne({ productId: req.params.productId }, (err, product) => {
    if (err) { return next(err); }
    if (product) {
      // generate thumbnail from Buffer in database
      Sharp(product.image.data).resize(250).toBuffer()
        .then((thumbnail) => {
          // send the product thumbnail to client
          res.contentType(product.image.contentType);
          return res.send(thumbnail);
        }).catch((err) => {
          return next(err);
        });
    } else {
      // if productId is invalid, return 404
      return next(err);
    }
  });
};
