import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export type UserDocument = mongoose.Document & {
  userId: string;
  email: string;
  password: string;
  points: number;
  info: {
    name: {
      first: string;
      last: string;
    },
    phone: string;
    address: string;
  };
  referral: {
    user: string;
    registration: string;
  };
  admin: boolean;
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
  admin: { type: Boolean, required: true, default: false }
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
