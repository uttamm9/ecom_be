const mongoose = require('mongoose')

const wishlistModel = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    }
},{versionKey:false,timestamps:true});

module.exports = mongoose.model('wishlist', wishlistModel);