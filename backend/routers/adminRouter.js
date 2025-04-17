const express = require('express')
const router = express.Router()
const admincontroller = require('../controller/adminController')

router.get('/allcustomers',admincontroller.getcustomers)

router.get('/allorders',admincontroller.getorders)

router.get('/allprodcuts',admincontroller.allproduct)

router.get('/allsupllier',admincontroller.allsuppliers)


module.exports = router