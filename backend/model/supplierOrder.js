const mongoose = require('mongoose');

const supplierOrderSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'supplier',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product',
    required: true,
  },
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'address',
    required: true,
  },
  status: {
    type: String,
    default: 'innciet',
  },
  paymentMode: {
    type: String,
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'order'
    
  },
}, { timestamps: true, versionKey:false}
);

module.exports = mongoose.model('supplierorder', supplierOrderSchema);