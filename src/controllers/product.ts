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

/**
 * GET /products/:productId/details
 * Display product details from "productId"
 */
export const getProductDetails = (req: Request, res: Response, next: NextFunction) => {
  // find product in database via productId and see if it's available
  Product.findOne({ productId: req.params.productId, available: true }, (err, product) => {
    if (err) { return next(err); }
    if (product) {
      console.log(product);
      return res.render("public/product-details", {
        title: "product detail",
        user: req.user,
        product: product,
        image: "/products/" + product.productId + "/image?width=500"
      })
    } else {
      // if productId is invalid or product is not set as available, return 404
      return next(err);
    }
  });
};
