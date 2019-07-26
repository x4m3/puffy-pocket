import { Request, Response, NextFunction } from "express";
import { Product } from "../models/product";

/**
 * GET /
 * home page
 */
export const index = (req: Request, res: Response, next: NextFunction) => {
  // if user is not logged in, return public homepage
  if (req.isUnauthenticated()) {
    return res.render("index-public", {
      title: "homepage"
    });
  }

  // number of products to display per page
  const productsPerPage: number = 3;

  // current page to display (0 if not specified in url, otherwise number - 1)
  // we count starting from 0, remember :)
  const currentPage: number = req.query.page - 1 || 0;

  type productData = {
    name: string;
    price: number;
    points: number;
    image: string;
    thumbnail: string;
  };
  let productList: Array<productData> = [];

  Product.find({ available: true }, (err, products) => {
    if (err) { return next(err); }
    products.forEach((product) => {
      productList.push({
        name: product.name,
        price: product.price,
        points: product.points,
        image: "/products/" + product.productId + "/image",
        thumbnail: "/products/" + product.productId + "/image?width=250"
      });
    });
    res.render("index", {
      title: "homepage",
      products: productList
    });
  }).limit(productsPerPage).skip(currentPage * productsPerPage);
};
