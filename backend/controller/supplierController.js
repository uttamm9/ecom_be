const supplierModel = require('../model/supplierModel');
const userModel = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretkey = '32wrdc34ferc5tfvc4erfd3e4r';
const {SendMail} = require('C:/Users/uttam/OneDrive/Desktop/ENV/Nodemailer');

exports.supplierSignup = async (req, res) => {
  // console.log(req.body);
  try {
    const {name,gstNo,contactNumber,category,businessName,businessAddress,businessEmail,aadharCardNo,password} = req.body;
    if(!(name && gstNo && contactNumber && category && businessName && businessAddress && businessEmail && aadharCardNo && password)) {
      return res.status(400).json({message: 'All fields are required'});
    }

    const supplier = await supplierModel.findOne({businessEmail});
    if(supplier) {
      return res.status(400).json({message: 'Supplier already exists'});
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
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
    await newSupplier.save();
    const userexist = await userModel.findOne({email: businessEmail});
    if(!userexist) {
      const createUser = new userModel({
        name: businessName,
        email: businessEmail,
        password: hashPassword,
        phone: contactNumber,
        supplier_id: newSupplier._id
      });
      await createUser.save();
    }
  
    return res.status(201).json({message: 'Supplier registered successfully'});

  } catch (error) {
    console.error(error);
    return res.status(500).json({message: 'Internal server error'});
  }
}