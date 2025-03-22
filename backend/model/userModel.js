const mongoose = require('mongoose');

const userModel = mongoose.Schema({
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
    phone: {
        type: String,
        required: true
    },
    supplier_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'supplier',
        required: false
    },
    otp: {
        type: String,
        required: false
    },
    otpTime: {
        type: Date,
        required: false
    },
},{versionKey:false,timestamps:true}); 
module.exports = mongoose.model('user', userModel);