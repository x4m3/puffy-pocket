module.exports = function (firstName, lastName, nb) {
  if (!firstName || !lastName) {
    return;
  }

  // store first characters of firstName and lastName
  var string = firstName.charAt(0) + lastName.charAt(0);

  for (var i = 0; i < nb; i++) {
    // generate a random digit and store it in the string
    string += Math.floor(Math.random() * 9);
  }

  return string;
};
