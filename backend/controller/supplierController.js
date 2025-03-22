const supplierModel = require('../model/supplierModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretkey = '32wrdc34ferc5tfvc4erfd3e4r';
const {SendMail} = require('C:/Users/uttam/OneDrive/Desktop/ENV/Nodemailer');

exports.supplierSignup = async (req, res) => {
  // console.log(req.body);
  try {
    const {name,gstNo,contactNumber,category,businessName,businessAddress,businessEmail,aadharCardNo} = req.body;
    if(!(name && gstNo && contactNumber && category && businessName && businessAddress && businessEmail && aadharCardNo)) {
      return res.status(400).json({message: 'All fields are required'});
    }

    const supplier = await supplierModel.findOne({gstNo});
    if(supplier) {
      return res.status(400).json({message: 'Supplier already exists'});
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(gstNo, salt);
    const newSupplier = new supplierModel({
      name,
      gstNo,
      contactNumber,
      category,
      businessName,
      businessAddress,
      businessEmail,
      aadharCardNo,
      password: hashPassword
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({message: 'Internal server error'});
  }
}