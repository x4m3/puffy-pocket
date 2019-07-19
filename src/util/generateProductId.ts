import { Product } from "../models/product";
import uuid from "uuid/v4";

export function generateProductId(): string {
  // generate product id
  var productId: string = uuid();

  // check in database if already exists
  Product.findOne({ productId: productId }, (err, existingId) => {
    if (err) { return false; }
    // call function again to generate a new id and check again
    if (existingId) { generateProductId(); }
  });
  return productId;
};
