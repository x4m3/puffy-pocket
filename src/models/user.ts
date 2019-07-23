import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export type UserDocument = mongoose.Document & {
  userId: string; // unique user id
  email: string; // email address of user
  password: string; // password
  points: number; // points of user
  info: {
    name: {
      first: string; // first name
      last: string; // last name
    },
    phone: string; // phone number
    address: string; // postal address
  };
  referral: {
    user: string; // code to give to others
    registration: string; // code used to register
  };
  firstUser: boolean; // user should not be deleted if this is set to true
  admin: boolean; // administrator of store ?
};

const UserSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  email: { type: String, lowercase: true, unique: true, index: true },
  password: String,
  points: Number,
  info: {
    name: {
      first: String,
      last: String
    },
    phone: String,
    address: String
  },
  referral: {
    user: String,
    registration: String
  },
  admin: { type: Boolean, required: true, default: false },
  firstUser: { type: Boolean, default: false }
}, { timestamps: true });

/**
 * Password hashing
 */
UserSchema.pre("save", function save(next) {
  const user = this as UserDocument;

  // if password field has not changed
  if (!user.isModified("password")) { return next(); }

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
