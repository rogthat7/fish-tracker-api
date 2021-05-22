const mongoose = require("mongoose");
//User Schema
const unverifiedUserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  emailToken: {
    type: String,
    required: false,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("UnverifiedUser", unverifiedUserSchema);
