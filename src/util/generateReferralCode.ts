/**
 * Generates a referral code based of a person's initials with a number of digits
 * @param   {string}  orig Referral code given to register
 * @param   {string}  firstName First name of person
 * @param   {string}  lastName Last name of person
 * @param   {number}  nb Number of digits in the referral code
 * @returns {string}  Referral code
 */
export function generateReferralCode(orig: string, firstName: string, lastName: string, nb: number): string {
  // store first characters of firstName and lastName
  var referralCode: string = firstName.charAt(0) + lastName.charAt(0);

  for (var i = 0; i < nb; i++) {
    // generate a random digit and store it in the string
    referralCode += Math.floor(Math.random() * 9);
  }

  // if by any chance the generated code is the same as the original one
  if (orig === referralCode) {
    generateReferralCode(orig, firstName, lastName, nb);
  }

  return referralCode;
};
