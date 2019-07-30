import { Request, Response, NextFunction } from "express";
import { Product } from "../models/product";

/**
 * GET /
 * home page
 */
export const index = (req: Request, res: Response, next: NextFunction) => {
  // if user is not logged in, return public homepage
  if (req.isUnauthenticated()) {
    return res.render("public/index-public", {
      title: "homepage"
    });
  }

  // number of products to display per page
  const productsPerPage: number = 3;

  // current page to display (0 if not specified in url, otherwise number - 1)
  // we count starting from 0, remember :)
  let currentPage: number = req.query.page - 1 || 0;
  // if a negative number is passed, redirect to first page
  if (currentPage < 0) { res.redirect("/?page=1"); }

  type productData = {
    name: string;
    price: number;
    points: number;
    image: string;
    thumbnail: string;
  };
  let productList: Array<productData> = [];

  // count total numbers of products available
  Product.count({ available: true }, function(err, count) {
    if (err) { return next(err); }

    let productsAvailable: number = count;

    // find products that are available with filters
    Product.find({ available: true }, (err, products) => {
      if (err) { return next(err); }

      // for each product found add it to list of products to be sent to client
      products.forEach(product => {
        productList.push({
          name: product.name,
          price: product.price,
          points: product.points,
          image: "/products/" + product.productId + "/image",
          thumbnail: "/products/" + product.productId + "/image?width=250"
        });
      });
      res.render("public/index", {
        title: "homepage",
        products: productList,
        // number of total pages
        numberOfPages: (productsAvailable / productsPerPage) + 1
      });
    })
      // limit search to number of products per page
      .limit(productsPerPage)
      // skip documents based of the current page
      .skip(currentPage * productsPerPage);
  });
};
