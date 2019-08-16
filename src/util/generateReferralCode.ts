import { User } from "../models/user";

/**
 * Generates a referral code based of a person's initials with a number of digits
 * @param   {string}   firstName First name of person
 * @param   {string}   lastName Last name of person
 * @param   {number}   nb Number of digits in the referral code
 * @returns {string}   Referral code
 */
export function generateReferralCode(firstName: string, lastName: string, nb: number): string {
  // store first characters of firstName and lastName
  var referralCode: string = firstName.charAt(0) + lastName.charAt(0);

  for (var i = 0; i < nb; i++) {
    // generate a random digit and store it in the string
    referralCode += Math.floor(Math.random() * 9);
  }

  User.findOne({ "referral.user": referralCode }, (err, existingReferral) => {
    if (err) { throw new Error("could not lookup referral code in database"); }

    if (existingReferral) {
      // if by any chance someone else already has the same code
      return generateReferralCode(firstName, lastName, nb);
    }
  });

  return referralCode;
};
