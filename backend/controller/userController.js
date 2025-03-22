const userModule = require('../model/userModel');
const supplierModule = require('../model/supplierModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretkey = '32wrdc34ferc5tfvc4erfd3e4r';
const {SendMail} = require('C:/Users/uttam/OneDrive/Desktop/ENV/Nodemailer');
const {FileUpload} = require('../Utility/ClodinaryService')
const moment = require('moment');

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
        if(role == 'supplier'){
            const supplier = await supplierModule.findOne({email})
            if(!supplier){
                return res.status(404).json({message:"signup as a supplier"})
            }
        }
        const user = await userModule.findOne({email}); 
        if (!user) {
            return res.status(400).json({message: 'User not found'});
        }
        console.log(user)
        const name = user.name;
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password'});
        }
        const token = jwt.sign({_id: user._id},secretkey,{expiresIn: '1d'});

        res.status(200).json({message:'User login Succesful',token,name,role});
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