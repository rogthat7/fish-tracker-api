const User = require("../models/user");
function emailExists(email) {
  return User.findOne({ email: email }).then((result) => {
    if (result) return true;
    else return false;
  });
}
function PhoneExists(phoneNumber) {
    return User.findOne({ phoneNumber: phoneNumber }).then((result) => {
      if (result) return true;
      else return false;
    });
  }
module.exports.emailExists = emailExists;
module.exports.PhoneExists = PhoneExists;
