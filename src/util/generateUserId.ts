import { User } from "../models/user";
import uuid from "uuid/v4";

export function generateUserId(): string {
  // generate user id
  var userId: string = uuid();

  // check in database if already exists
  User.findOne({ userId: userId }, (err, existingId) => {
    if (err) { return false; }
    // call function again to generate a new id and check again
    if (existingId) { generateUserId(); }
  });
  return userId;
}
