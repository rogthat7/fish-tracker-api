const mongoose = require('mongoose');
//User Schema
const unverifiedUserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    emailToken: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('UnverifiedUser',unverifiedUserSchema);