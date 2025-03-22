const mongoose = require('mongoose');

const supplierModel = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
  businessName: {
        type: String,
        required: true
    },
    businessEmail: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    businessAddress: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    aadharCardNo: {
        type: String,
        required: true
    }, 

},{versionKey:false,timestamps:true});
module.exports = mongoose.model('supplier', supplierModel);