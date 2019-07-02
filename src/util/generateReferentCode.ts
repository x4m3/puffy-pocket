module.exports = function (firstName: string, lastName: string, nb: number) {
  if (!firstName || !lastName || nb == 0) {
    throw new Error("bad parameters, make sure values are not empty");
  }

  // store first characters of firstName and lastName
  var string = firstName.charAt(0) + lastName.charAt(0);

  for (var i = 0; i < nb; i++) {
    // generate a random digit and store it in the string
    string += Math.floor(Math.random() * 9);
  }

  return string;
};
