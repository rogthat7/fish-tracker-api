const mongoose = require('mongoose');
const User = require('./user');
//User Schema
const loginSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required : true
    },
    refresh_token: {
        type: String,
        required: true
    },
    login_time:{
        type : String,
        required: true
    }
});

module.exports = mongoose.model('Login',loginSchema);