const express = require('express');
const router = express.Router()
const supplierController = require('../controller/supplierController');
const {supplierAuth} = require('../middlewere/supplierAuth')

router.post('/supplierSignup',supplierController.supplierSignup);

router.post('/addproduct',supplierAuth,supplierController.productAdd)

module.exports = router