const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
  receiverName: {
    type: String,
    required: true
  },
  receiverPhone: {
    type: String,
    required: true
  },
  pinCode: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  apartmentName: {
    type: String,
    required: true
  },
  landmark: {
    type: String,
    required: false
  },
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user',
  }
},{versionKey:false,timestamps:true})

module.exports = mongoose.model('address',addressSchema)