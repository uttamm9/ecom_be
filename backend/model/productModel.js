const mongoose = require('mongoose');

const productModel = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    supplier_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'supplier',
        required: true
    },
    description: {
        type: String,
        required: false
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    brand: {
        type: String,
        required: false
    },
    rating: {
        type: Number,
        required: false
    },
    reviews: {
        type: Number,
        required: false
    },
},{versionKey:false,timestamps:true});
module.exports = mongoose.model('product', productModel);