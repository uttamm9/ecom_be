const userController = require('../controller/userController');
const auth = require('../middlewere/userAuth');

const express = require('express'); 
const router = express.Router();

router.post('/userSignup',userController.usersignup);

router.post('/login', userController.login);

router.post('/getotp', userController.getOTP);

router.patch('/forgetPassword', userController.forgatePassword);

router.patch('/resetPassword', auth,userController.resetPassword);

router.get('/getAllproduts', auth, userController.allProducts);

router.get('/showSingleProdut/:id', auth, userController.singleProduct);

router.post('/addtowishlist',auth,userController.addToWishlist);

router.post('/addtocart',auth,userController.addToCart);

router.get('/getCartItems',auth,userController.getCartItems);

router.delete('/deletecartitem/:id',auth,userController.deletecartItem)

router.get('/wishlistdata',auth,userController.getwishlistdata)

router.delete('/removewishlist/:_id',auth,userController.removewishlist)

router.post('/address',auth,userController.addAddress)

router.get('/getaddress',auth,userController.getaddress)

router.delete('/deleteaddress/:_id',auth,userController.deleteaddress)

router.patch('/increseitem',auth,userController.increseitem)

router.patch('/decreseitem',auth,userController.decreseitem)

router.post('/placeorder',auth,userController.placeorder)

router.get('/myorders',auth,userController.getmyorders)


module.exports = router;