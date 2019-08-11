import { Request, Response, NextFunction } from "express";
import { Product, ProductDocument } from "../../models/product";
import { checkFileImage } from "../../util/checkFileImage";
import { generateProductId } from "../../util/generateProductId";
import * as fs from "fs";

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
    thumbnail: string;
  };
  let productList: Array<productData> = [];
  let numberOfProductsAvailable: number = 0;

  Product.find({}, (err, products) => {
    if (err) { return next(err); }
    products.forEach((product) => {
      productList.push({
        productId: product.productId,
        available: (product.available) ? "yes" : "no",
        name: product.name,
        price: product.price,
        points: product.points,
        thumbnail: "/products/" + product.productId + "/image?width=250"
      });
      if (product.available == true) {
        numberOfProductsAvailable++;
      }
    });
    res.render("admin/products", {
      title: "products - admin panel",
      user: req.user,
      products: productList,
      numberOfProducts: productList.length,
      numberOfProductsAvailable: numberOfProductsAvailable
    });
  });
};

/**
 * GET /admin/products/add
 * Add new product to database
 */
export const getProductsAdd = (req: Request, res: Response, next: NextFunction) => {
  return res.render("admin/product-add", {
    title: "add product - admin panel",
    user: req.user
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

    // render page with error message
    return res.render("admin/product-add", {
      title: "add product - admin panel",
      user: req.user,
      error: "Bad image format",
      productName: req.fields.productName,
      price: +req.fields.price,
      points: +req.fields.points
    });
  }

  const newProduct: ProductDocument = new Product({
    productId: generateProductId(),
    name: <string>req.fields.productName, // need to cast to string
    price: +req.fields.price, // "+" means to store as "number"
    points: +req.fields.points, // "+" means to store as "number"
    image: {
      data: fs.readFileSync(req.files.image.path),
      contentType: req.files.image.type
    },
    available: (req.fields.available == "true") ? true : false
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
 * GET /admin/products/delete/:productId
 * Delete product from "productId"
 */
export const getProductDelete = (req: Request, res: Response, next: NextFunction) => {
  // find product via productId in database
  Product.findOne({ productId: req.params.productId }, (err, productToDelete) => {
    if (err) { return next(err); }
    if (productToDelete) {
      // delete product
      productToDelete.remove((err, removedProduct) => {
        if (err) { return next(err); }

        // redirect back to the products page
        return res.redirect("/admin/products");
      });
    } else {
      // if productId is invalid, return 404
      return next(err);
    }
  });
};

/**
 * GET /admin/products/edit/:productId
 * Display edit product information from "productId"
 */
export const getProductEdit = (req: Request, res: Response, next: NextFunction) => {
  // try to find product in database
  Product.findOne({ productId: req.params.productId }, (err, product) => {
    if (err) { return next(err); }
    if (product) {
      return res.render("admin/product-edit", {
        title: "edit product - admin panel",
        user: req.user,
        productId: product.productId,
        productName: product.name,
        price: product.price,
        points: product.points,
        available: product.available,
        thumbnail: "/products/" + product.productId + "/image?width=250"
      })
    }
    // if productId is invalid, return 404
    return next(err);
  });
};

/**
 * POST /admin/products/edit/:productId
 * Edit product information from "productId"
 */
export const postProductEdit = (req: Request, res: Response, next: NextFunction) => {
  let name: string = <string>req.fields.productName;
  let price: number = +req.fields.price;
  let points: number = +req.fields.points;
  let available: boolean = (req.fields.available == "true") ? true : false;

  let errors: Array<string> = [];

  if (price < 0) {
    errors.push("Price can not be negative");
  }
  if (points < 0) {
    errors.push("Points can not be negative");
  }

  // if no files were uploaded
  if (req.files.image.size == 0) {
    // delete empty file from filesystem
    fs.unlink(req.files.image.path, (err) => { if (err) throw err; });
  } else {
    // if uploaded file is not an image
    if (checkFileImage(req.files.image.name) == false) {
      // delete uploaded file from filesystem
      fs.unlink(req.files.image.path, (err) => { if (err) throw err; });

      // add error message to array
      errors.push("Bad image format");
    }
  }

  // find product in database
  Product.findOne({ userId: req.params.userId }, (err, product) => {
    if (err) { return next(err); }
    if (product) {

      if (errors.length > 0) {
        // if there is errors, render page again with messages and values from database
        return res.render("admin/product-edit", {
          title: "edit product - admin panel",
          user: req.user,
          errors: errors,
          productId: product.productId,
          productName: product.name,
          price: product.price,
          points: product.points,
          available: product.available,
          thumbnail: "/products/" + product.productId + "/image?width=250"
        });
      }

      // update info if it has changed
      if (name.length != 0) { product.name = name; }
      if (price != product.price) { product.price = price; }
      if (points != product.points) { product.points = points; }

      // save new image if it has changed
      if (req.files.image.size != 0) {
        product.image.data = fs.readFileSync(req.files.image.path);
        product.image.contentType = req.files.image.type;

        // delete uploaded file from filesystem
        fs.unlink(req.files.image.path, (err) => {
          if (err) throw err;
        });
      }

      // change available status
      if (available == true && product.available == false) { product.available = true; }
      if (available == false && product.available == true) { product.available = false; }

      // save changes in database
      product.save((err) => {
        if (err) {
          console.log(err);
          return next(err);
        }

        // redirect back to the products page
        return res.redirect("/admin/products");
      });
    }
  });
};
