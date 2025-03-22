const mongoose = require('mongoose');

const productImageModel = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    image: {
        type: String,
        required: true
    }
},{versionKey:false,timestamps:true});
module.exports = mongoose.model('productImage', productImageModel);