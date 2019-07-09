import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export type UserDocument = mongoose.Document & {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  referent: string;
};

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, lowercase: true, required: [ true, "can't be blank" ], unique: true, index: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  referent: { type: String, required: true },
}, { timestamps: true });

/**
 * Password hashing
 */
UserSchema.pre("save", function save(next) {
  const user = this as UserDocument;
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, (err: mongoose.Error, hash: string) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

/**
 * Compare password
 */
type comparePasswordFunction = (candidatePassword: string, cb: (err: any, isMatch: any) => {}) => void;

const comparePassword: comparePasswordFunction = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err: mongoose.Error, isMatch: boolean) => {
    cb(err, isMatch);
  });
};

UserSchema.methods.comparePassword = comparePassword;

export const User = mongoose.model<UserDocument>("User", UserSchema);
