const mongoose = require('mongoose')

const orderDetails = new mongoose.Schema({
  cartid:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'cart',
    require:true
  },
  address:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'address',
    require:true
  },
  userid:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user',
    require:true
  },
  status:{
    type:String,
    default:'place'
  },
  paymentmode:{
    type:String,
    default:'COD'
  },
  deliveriDate:{
    type:Date,
    
  }
})

module.exports = mongoose.model('order',orderDetails);