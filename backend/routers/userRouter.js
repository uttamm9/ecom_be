const userController = require('../controller/userController');
const auth = require('../middlewere/userAuth');

const express = require('express'); 
const router = express.Router();

router.post('/userSignup',userController.usersignup);

router.post('/login', userController.login);

router.post('/getotp', userController.getOTP);

router.patch('/forgetPassword', userController.forgatePassword);

router.patch('/resetPassword', auth,userController.resetPassword);

module.exports = router;