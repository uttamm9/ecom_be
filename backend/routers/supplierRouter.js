const express = require('express');
const router = express.Router()
const supplierController = require('../controller/supplierController');

router.post('/supplierSignup',supplierController.supplierSignup);

router.post('/addproduct',supplierController.productAdd)

module.exports = router