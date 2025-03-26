const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const cartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'product'
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