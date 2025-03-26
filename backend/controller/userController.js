const userModule = require('../model/userModel');
const supplierModule = require('../model/supplierModel');
const productImage = require('../model/productImage');
const productModel = require('../model/productModel');
const wishlistModel = require('../model/wishlist');
const addressModel = require('../model/userAddres')
const cartModel = require('../model/addToCart');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretkey = '32wrdc34ferc5tfvc4erfd3e4r';
const {SendMail} = require('C:/Users/uttam/OneDrive/Desktop/ENV/Nodemailer');
const {FileUpload} = require('../Utility/ClodinaryService')
const moment = require('moment');
const e = require('express');

exports.usersignup = async (req, res) => {
    try {
        console.log("req.body>>>>",req.body)
   
        const { email, password,name,phone} = req.body;
        if(!(email && password && name && phone )) {
            return res.status(400).json({message: 'All fields are required'});
        }
        const user = await userModule.findOne({email}); // check if user already exists
        if (user) {
            return res.status(400).json({message: 'User already exists'});
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const newUser = new userModule({email,
            password: hashPassword,
            name,
            phone,
        }); 
        await newUser.save();
        const MailInfo = await SendMail(email,`Account created`,`Account created successfully`)
    
        let verify = 'email not sent';
        if(MailInfo.messageId){
            verify = 'Email sent successfully';
        }
        res.status(201).json({message: 'User created',email:verify});
    }
    catch (err) {
        res.status(500).json({message: 'Internal server error'});
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        let username;
      
        const user = await userModule.findOne({email}); 
        if (!user) {
            return res.status(400).json({message: 'User not found'});
        }
        console.log('user', user);
        username = user.name;
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password'});
        }

        if(role == 'supplier'){
            const supplier = await supplierModule.findOne({businessEmail:email})
            console.log("supplier",supplier)
            if(!supplier){
                return res.status(404).json({message:"signup as a supplier"})
            }
            username = supplier.businessName;
        }

        const token = jwt.sign({_id: user._id},secretkey,{expiresIn: '1d'});

        res.status(200).json({message:'User login Succesful',token,username,role});
    }
    catch (err) {
        res.status(500).json({
            message: 'Internal server error'
        });
    }
}

exports.forgatePassword = async (req, res) => {
    try {
        const { email , newPassword,otp} = req.body;
        const user = await userModule.findOne({email});
        if (!user) {
            return res.status(400).json({  message: 'User not found' });
        }
        const DBotp = user.otp;
        if(DBotp!=otp){
            return res.status(404).json({message:"Invalid OTP"})
        }
        if(moment()>user.otpTime){
            return res.status(400).json({message:"OTP expire"})
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newPassword, salt);
        await userModule.updateOne({email}, {password: hashPassword});
        // Send token to user's email
        const isSupplier = await supplierModule.findOne({businessEmail:email});
        if(isSupplier){
            await supplierModule.updateOne({businessEmail:email},{password:hashPassword})
        }
        
        res.status(200).json({message: 'Password updated'});
    }
    catch (err) {
        res.status(500).json({
            message: 'Internal server error'
        });
    }
}

exports.getOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModule.findOne({email});
        if (!user) {
            return res.status(400).json({message: 'User not found'});
        }
        // Send OTP to user's email
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpTime = moment().add(5, 'minutes');

        const data = await userModule.updateOne({email}, {otp, otpTime});
        console.log(data);
      
        const MailInfo = await SendMail(email,`OTP for password reset`,`Your OTP is ${otp}`)
        console.log('MailInfo', MailInfo);
        
        if (!MailInfo.messageId) {
            return res.status(500).json({message: 'Failed to send OTP'});
        }
        res.status(200).json({message: 'OTP sent'});
    }
    catch (err) {
        res.status(500).json({
            message: 'Internal server error'
        });
    }
}

exports.resetPassword = async (req, res) => {
    try {
        console.log('....user_email',req.user.email);
        const email = req.user.email;

        const { newPassword , currentPassword} = req.body;
        const user = await userModule.findOne({email});
        if (!user) { return res.status(400).json({message: 'User not found'});
    }
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(400).json({message: 'Invalid password'});
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newPassword, salt);
        const data = await userModule.updateOne({email}, {password: hashPassword }); 
        console.log('data',data);

        res.status(200).json({ message: 'Password updated'});
    }
    catch (err) {
        res.status(500).json({
            message: 'Internal server error'
        });
    }
}

exports.allProducts = async (req, res) => {
    try {
        const products = await productImage.find().populate('product_id');
        console.log('products', products);
        res.status(200).json(products);
    }
    catch (err) {
        res.status(500).json({
            message: 'Internal server error'
        });
    }
}

exports.singleProduct = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('id', id);
        const product = await productImage.findOne({_id: id}).populate({
            path: 'product_id',
            populate: {
            path: 'supplier_id',
            model: 'supplier'
            }
        });
       
        console.log('product', product);
        res.status(200).json(product);
    }
    catch (err) {
        res.status(500).json({message: 'Internal server error'});
    }
}

exports.addToCart = async (req, res) => {
    try {
        const { product_id } = req.body;
        const user_id = req.user._id;
        console.log('user_id', user_id);
        const product = await productModel.findOne({_id: product_id});
        if (!product) {
            return res.status(404).json({message: 'Product not found'});
        }
        const cartData = new cartModel({
            userId: user_id,
            productId: product_id,
            });

        console.log('data', cartData);
        await cartData.save();
        res.status(200).json({message: 'Product added to cart'});
    }
    catch (err) {
        res.status(500).json({message: 'Internal server error'});
    }
}

exports.getCartItems = async (req, res) => {
    try {
        const user_id = req.user._id;

        const cartItems = await cartModel.aggregate([
            { $match: { userId: user_id } }, // Filter by user ID
            {
                $lookup: {
                    from: 'products', // Ensure this matches the correct collection name
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'productimages', // Ensure this matches the correct MongoDB collection name
                    localField: 'productId',
                    foreignField: 'product_id',
                    as: 'productImages'
                }
            },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    productId: 1,
                    quantity: 1,
                    createdAt: 1,
                    "productDetails.name": 1,
                    "productDetails.price": 1,
                    "productDetails.quantity": 1,
                    "productDetails.category": 1,
                    "productDetails.supplier_id": 1,
                    "productDetails.description": 1,
                    "productDetails.isAvailable": 1,
                    "productDetails.brand": 1,
                    "productDetails.rating": 1,
                    "productDetails.reviews": 1,
                    productImages: { $arrayElemAt: ["$productImages.imageUrl", 0] } // Get the first image only
                }
            }
        ]);
        
        console.log(cartItems);
        
        console.log('cartItems', cartItems);
        res.status(200).json(cartItems);
    }
    catch (err) {
        res.status(500).json({message: 'Internal server error'});
    }
}

exports.addToWishlist = async (req, res) => {
    console.log('req.body', req.body);
    try {
        const { product_id ,wishlist} = req.body;
        if (!req.user || !req.user._id) {
            return res.status(401).json({message: 'Login required'});
        }
        const user_id = req.user._id;
        console.log('user_id', user_id);
        if(wishlist){
            const wishlistData = new wishlistModel({
                user_id: user_id,
                product_id: product_id,
                });
    
            console.log('data', wishlistData);
            await wishlistData.save();
            res.status(200).json({message: 'Product added to wishlist'});
        }else{
            await wishlistModel.deleteOne({user_id:user_id,product_id:product_id})
            res.status(200).json({message: 'Product removed from wishlist'});
        }
    }
    catch (err) {
        res.status(500).json({message: 'Internal server error'});
    }
}

exports.getwishlistdata = async (req, res) => {
    console.log('req.user', req.user);

    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Login required' });
        }

        const wishlistData = await wishlistModel.aggregate([
            { $match: { user_id: req.user._id } }, // Filter by user ID
            {
                $lookup: {
                    from: 'products', // Collection name in MongoDB
                    localField: 'product_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: "$productDetails" }, // Flatten the productDetails array
            {
                $lookup: {
                    from: 'productimages', // Collection name in MongoDB
                    localField: 'product_id',
                    foreignField: 'product_id',
                    as: 'productImages'
                }
            },
            {
                $project: {
                    _id: 1,
                    user_id: 1,
                    "productDetails.name": 1,
                    "productDetails.price": 1,
                    "productDetails.category": 1,
                    "productDetails._id": 1,
                    productImages: { $arrayElemAt: ["$productImages.imageUrl", 0] } // Get first image
                }
            }
        ]);

        if (!wishlistData.length) {
            return res.status(404).json({ message: 'No items in wishlist' });
        }

        console.log('wishlistdata', wishlistData);
        res.status(200).json(wishlistData);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.removewishlist = async (req, res) => {
    try {
        const { _id } = req.params;
       
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Login required' });
        }

        const wishlistItem = await wishlistModel.findOne({ user_id: req.user._id, product_id:_id });
        console.log('wishlist',wishlistItem)
        if (!wishlistItem) {
            return res.status(404).json({ message: 'Item not found in wishlist' });
        }
        await wishlistModel.findByIdAndDelete({_id:wishlistItem._id})
        res.status(200).json({ message: 'Product removed from wishlist' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.addAddress = async (req, res) => {
    try {
        const { apartmentName, city, landmark, pinCode, receiverName, receiverPhone } = req.body;

        if (!(apartmentName && city && landmark && pinCode && receiverName && receiverPhone)) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newAddress = new addressModel({
            apartmentName,
            city,
            landmark,
            pinCode,
            receiverName,
            receiverPhone,
            userId: req.user._id
        });

        await newAddress.save();
        res.status(201).json({ message: 'Address added successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getaddress = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Login required' });
        }

        const addresses = await addressModel.find({ userId: req.user._id });
        if (!addresses.length) {
            return res.status(404).json({ message: 'No addresses found' });
        }

        res.status(200).json(addresses);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.deleteaddress = async (req, res) => {
    try {
        const { _id } = req.params;
        
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Login required' });
        }

        const address = await addressModel.findOne({ _id: _id, userId: req.user._id });
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        await addressModel.deleteOne({ _id: _id, userId: req.user._id });
        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
}