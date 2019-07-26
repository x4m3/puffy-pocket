/**
 * Generates a referral code based of a person's initials with a number of digits
 * @param   {string}   firstName First name of person
 * @param   {string}   lastName Last name of person
 * @param   {number}   nb Number of digits in the referral code
 * @param   {string=}  orig Referral code given to register (optional)
 * @returns {string}   Referral code
 */
export function generateReferralCode(firstName: string, lastName: string, nb: number, orig?: string): string {
  // store first characters of firstName and lastName
  var referralCode: string = firstName.charAt(0) + lastName.charAt(0);

  for (var i = 0; i < nb; i++) {
    // generate a random digit and store it in the string
    referralCode += Math.floor(Math.random() * 9);
  }

  // if by any chance the generated code is the same as the original one
  if (orig === referralCode) {
    generateReferralCode(firstName, lastName, nb, orig);
  }

  return referralCode;
};
