import { User } from "../models/user";
import { generateReferentCode } from "./generateReferentCode";
import { generateUserId } from "./generateUserId";

/**
 * Inserts fake user in database
 * @param   {string} firstName First name of user
 * @param   {string} lastName  Last name of user
 * @param   {string} email     Email address of user
 * @param   {string} phone     Phone number of user
 * @param   {string} address   Postal address of user
 * @param   {string} password  User's password
 * @returns Returns boolean true on success, false on error
 */
export function insertFakeUser(firstName: string, lastName: string, email: string, phone: string, address: string, password: string): boolean {
  // create new user, generate user id and referent code
  const newUser = new User({
    id: generateUserId(),
    firstName: firstName,
    lastName: lastName,
    email: email,
    phone: phone,
    address: address,
    password: password,
    referent: generateReferentCode(firstName, lastName)
  });

  // save new user in database
  newUser.save((err) => {
    if (err) { return false; }
  });
  return true;
}
