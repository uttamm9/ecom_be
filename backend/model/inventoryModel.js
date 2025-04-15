const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  productId : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'supplier',
    required: true
  },
}, {versionKey: false,
  collection: 'inventory',
  timestamps: true
});

module.exports = mongoose.model('Inventory', inventorySchema);