const secretkey = '32wrdc34ferc5tfvc4erfd3e4r';
const jwt = require('jsonwebtoken')
const supplierModel = require('../model/supplierModel');
const userModel = require('../model/userModel');

exports.supplierAuth = async(req,res,next) =>{
  const token = req?.headers?.authorization;
  console.log("....>>>>.Token >>>>",token)
  if(!token){
    return res.status(401).json({massage:"Unauthoriza"});
  }
  const splitToken = token.split(" ")[1]
  // console.log(">>>>>>SplitToken>>>",splitToken)
  
  const decode = jwt.verify(splitToken,secretkey)
  console.log(">>>>Decode>>>",decode)
  if(!decode){
    return res.status(401).json({massage:'invalid token'});
  }
  const user = await userModel.findById(decode._id)
  console.log(">>>>>>user>>>>",user)
  const supplier = await supplierModel.findById(user.supplier_id)
  console.log(">>>>>>supplier>>>>",supplier)
  if(!supplier){
    return res.status(401).json({massage:'supplier not found'})

  }
  req.supplier = supplier;
  
  next() 
}