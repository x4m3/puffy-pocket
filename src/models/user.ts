import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  // TODO: see if 'required' is really useful, see best practices for mongodb schema
  id: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  referent: { type: String, required: true },
  creationDate: { type: Date, default: Date.now }
});

export const User = mongoose.model("User", UserSchema);
