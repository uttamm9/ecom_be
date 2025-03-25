const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const cartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},{timestamps:true,versionKey:false});

const Cart = mongoose.model('cart', cartSchema);
module.exports = Cart;