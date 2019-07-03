/**
 * Generates a referent code based of a person's initials with a number of digits
 * @param   {string}  firstName First name of person
 * @param   {string}  lastName Last name of person
 * @param   {number=} nb Number of digits in the referent code (optional, defaults to 3)
 * @returns {string}  Referent code
 */
export function generateReferentCode(firstName: string, lastName: string, nb?: number): string {
  if (!nb || nb == 0) {
    nb = 3;
  }

  // store first characters of firstName and lastName
  var referentCode: string = firstName.charAt(0) + lastName.charAt(0);

  for (var i = 0; i < nb; i++) {
    // generate a random digit and store it in the string
    referentCode += Math.floor(Math.random() * 9);
  }

  return referentCode;
};
