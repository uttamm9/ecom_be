const supplierModel = require('../model/supplierModel');
const productImage = require('../model/productImage');
const productModel = require('../model/productModel');
const userModel = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretkey = '32wrdc34ferc5tfvc4erfd3e4r';
const {SendMail} = require('C:/Users/uttam/OneDrive/Desktop/ENV/Nodemailer');
const {FileUpload} = require('../Utility/ClodinaryService')

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
    await SendMail(businessEmail, 'Supplier Registration', 'Supplier registered successfully');
    return res.status(201).json({message: 'Supplier registered successfully'});

  } catch (error) {
    console.error(error);
    return res.status(500).json({message: 'Internal server error'});
  }
}

exports.productAdd = async (req, res) => {
  console.log('req.body', req.body);
  console.log('req.files', req.files);
  console.log('req.supplier', req.supplier._id);
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files were uploaded' });
  }

  try {
    const {name,price,quantity,category,description,brand} = req.body;
    if(!(name && price && quantity && category && description && brand)) {
      return res.status(400).json({message: 'All fields are required'});
    }
    const newProduct = new productModel({
      name,
      price,
      quantity,
      category,
      description,
      brand,
      supplier_id: req.supplier._id
    });
    console.log('product', newProduct);
    await newProduct.save();
    let uploadedFiles = [];
    for(const file in req.files){
      const result = await FileUpload(req.files[file]);
      uploadedFiles.push(result.url);
    }
    console.log('uploadedFiles', uploadedFiles);
    return;
    const newProductImage = new productImage({
      product_id: newProduct._id,
      imageUrl: uploadedFiles
    });
    await newProductImage.save();


    return res.status(201).json({message: 'Product added successfully'});
  } catch (error) {
    console.error(error);
    return res.status(500).json({message: 'Internal server error'});
  }
}