const userModel = require('../model/userModel')
const supplierordermodel = require('../model/supplierOrder') 
const productmodel = require('../model/productModel')
const suppliersmodel = require('../model/supplierModel')

exports.getcustomers = async(req,res)=>{
    try {
      const users = await userModel.find()
      // console.log('users>>>',users)
      return res.status(200).json(users)
    } catch (error) {
      return res.status(500).json({message:'internal server error'})
    }
}

exports.getorders = async(req,res)=>{
  try {
    const orders = await supplierordermodel.find().populate('productId')
    res.status(200).json(orders)
  } catch (error) {
    return res.status(500).json({message:'internal server error'})
  }
}

exports.allproduct = async(req,res)=>{
  try {
    const prodct = await productmodel.find();
    res.status(200).json(prodct)
  } catch (error) {
    return res.status(500).json({message:'internal server error'})
  }
}

exports.allsuppliers = async(req,res)=>{
  try {
    const suppliers = await suppliersmodel.find();
    res.status(200).json(suppliers);
  } catch (error) {
    return res.status(500).json({message:'internal server error'})
  }
}