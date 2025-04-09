const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  productId : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
}, {versionKey: false,
  collection: 'inventory',
  timestamps: true
});

module.exports = mongoose.model('Inventory', inventorySchema);