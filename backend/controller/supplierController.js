const supplierModel = require('../model/supplierModel');
const productImage = require('../model/productImage');
const productModel = require('../model/productModel');
const userModel = require('../model/userModel');
const supplierOrders = require('../model/supplierOrder');
const bcrypt = require('bcrypt');
const {SendMail} = require('C:/Users/uttam/OneDrive/Desktop/ENV/Nodemailer');
const {FileUpload} = require('../Utility/ClodinaryService');
const inventoryModel = require('../model/inventoryModel');

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
    await new inventoryModel({
      productId: newProduct._id,
      quantity: quantity,
      supplierId: req.supplier._id
    }).save();
    
    let uploadedFiles = [];
    const filesArray = Object.values(req.files);
    for(files of filesArray){
      const result = await FileUpload(files);
      console.log('result', result);
      result.forEach(file => {
        uploadedFiles.push(file.url);
      });
    }
    console.log('uploadedFiles', uploadedFiles);
   
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

exports.getProducts = async (req, res) => {
  try {
    if (!req.supplier || !req.supplier._id) {
      return res.status(400).json({ message: 'Supplier ID is required' });
    }
    const products = await inventoryModel.find({ supplierId: req.supplier._id }).populate('productId');
    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }
    return res.status(200).json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

exports.editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, quantity, category, description, brand } = req.body;
    if (!(name && price && quantity && category && description && brand)) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const product = await productModel.findOne({ _id: id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await productModel.updateOne({ _id: id }, { name, price, quantity, category, description, brand });
    return res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
  
    const product = await productModel.findById({_id:id});
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await productModel.findByIdAndUpdate({_id:id}, {isDeleted: true});
    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

exports.getOrders = async (req, res) => {
  console.log('req.supplier', req.supplier._id);
  if (!req.supplier || !req.supplier._id) {
    return res.status(400).json({ message: 'Supplier ID is required' });
  }
  try {
    const orders = await supplierOrders.find({ supplierId: req.supplier._id }).populate('productId')
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
    }
    return res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

exports.orderAction = async (req,res)=>{
  console.log('req.body', req.body);
  console.log('req.supplier', req.supplier._id);
  try {
    const { _id, status } = req.body;

    if (!_id) {
      return res.status(400).json({ message: 'Order ID is required' });
    }
    const order = await supplierOrders.findOne({ _id});
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    console.log("oder>>>",order)
    if(status == 'cancel'){
      await supplierOrders.findByIdAndUpdate({_id}, { status: status })
      const product = await productModel.findById({_id: order.productId});
      const inventory = await inventoryModel.findOne({productId: order.productId, supplierId: req.supplier._id});
      if(inventory){
        await inventoryModel.findByIdAndUpdate({_id: inventory._id}, { quantity: inventory.quantity + order.quantity })
    }
  }
    if(status == 'packege'){
      await supplierOrders.findByIdAndUpdate({_id}, { status: status })
    }
    if(status=='deliver'){
      await supplierOrders.findByIdAndUpdate({_id}, { status: status })
    }
    if(status=='return'){
      await supplierOrders.findByIdAndUpdate({_id}, { status: status })
    }
    if(status=='returned'){
      await supplierOrders.findByIdAndUpdate({_id}, { status: status })
      const product = await productModel.findById({_id: order.productId});
      const inventory = await inventoryModel.findOne({productId: order.productId, supplierId: req.supplier._id});
      if(inventory){
        await inventoryModel.findByIdAndUpdate({_id: inventory._id}, { quantity: inventory.quantity - order.quantity })
    }
    }
    return res.status(200).json({ message: `Order ${status} successfully` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }

}

exports.getInventory = async (req, res) => {
  console.log('req.supplier', req.supplier._id);
  try {
    const inventories = await inventoryModel.find({ supplierId: req.supplier._id }).populate('productId');
    if (!inventories || inventories.length === 0) {
      return res.status(404).json({ message: 'No inventory found' });
    }
    return res.status(200).json(inventories);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

exports.addstock = async (req, res) => {
  console.log('req.body', req.body);
  console.log('req.supplier', req.supplier._id);
  try {
    const { product_id, quantity } = req.body;
    if (!(product_id && quantity)) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }
    const product = await productModel.findOne({ _id: product_id, supplier_id: req.supplier._id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const inventory = await inventoryModel.findOne({ productId: product_id, supplierId: req.supplier._id });
    if (inventory) {
      await inventoryModel.updateOne({ _id: inventory._id }, { $inc: { quantity: quantity } });
    } else {
      await new inventoryModel({
        productId: product_id,
        quantity: quantity,
        supplierId: req.supplier._id
      }).save();
    }
    return res.status(200).json({ message: 'Stock added successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }

}
