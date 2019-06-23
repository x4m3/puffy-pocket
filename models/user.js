var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  referent: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = User;
