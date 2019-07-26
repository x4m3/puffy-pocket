import { Request, Response, NextFunction } from "express";
import { Product } from "../models/product";
import Sharp from "sharp";

/**
 * GET /products/:productId/image
 * Display product image from "productId"
 */
export const getProductImage = (req: Request, res: Response, next: NextFunction) => {
  const width: number = +req.query.width;

  // try to find in database the product
  Product.findOne({ productId: req.params.productId }, (err, product) => {
    if (err) { return next(err); }
    if (product) {
      // if thumbnail is asked
      if (width) {
        // generate thumbnail from Buffer in database
        Sharp(product.image.data).resize(width).toBuffer()
          .then((thumbnail) => {
            // send the product thumbnail to client
            res.contentType(product.image.contentType);
            return res.send(thumbnail);
          }).catch((err) => {
            return next(err);
          });
      } else {
        // send the product image to client
        res.contentType(product.image.contentType);
        return res.send(product.image.data);
      }
    } else {
      // if productId is invalid, return 404
      return next(err);
    }
  });
};
