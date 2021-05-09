const mongoose = require('mongoose');
//User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required : true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true,
        maxlength:10,
        minlengeth:10
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },
    isConfirmed: {
        type: Boolean,
        required: true,
        default: false
    }
});

module.exports = mongoose.model('User',userSchema);