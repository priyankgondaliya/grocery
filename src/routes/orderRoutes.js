const express = require('express');
const router = express.Router();

// const checkUser = require('../middleware/authMiddleware');

const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');

// place order
router.post('/orders', async (req, res) => {
    // create order
})

module.exports = router;