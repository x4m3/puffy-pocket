import mongoose from "mongoose";

export type ProductDocument = mongoose.Document & {
  productId: string; // unique product id
  available: boolean; // available to buy?
  name: string; // name
  price: number; // price
  points: number; // points of this product
  image: { // image of product
    data: Buffer;
    contentType: string;
  };
};

const ProductSchema = new mongoose.Schema({
  productId: { type: String, unique: true, required: true },
  available: { type: Boolean, required: true, default: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 1 },
  points: { type: Number, required: true, min: 1 },
  image: {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true }
  }
}, { timestamps: true });

export const Product = mongoose.model<ProductDocument>("Product", ProductSchema);
