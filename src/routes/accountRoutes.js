const express = require('express');
const router = express.Router();
const formatDate = require('../helpers/formateDate');

const checkUser = require('../middleware/authMiddleware');
const checkStore = require('../middleware/selectedStore');

const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');

router.get("/signup", checkUser, async (req,res)=>{
    if (req.user) {
        return res.redirect('/account');
        // var cart = await Cart.findOne({ userId: req.user.id});
        // var cartLength = cart.products.length;
    } else {
        var cartLength = req.session.cart.products.length;
    }
    res.status(201).render("account", {
        title: 'Signup | Signin',
        user: req.user,
        cartLength
    });
});

router.get("/account", checkUser, checkStore, async (req,res)=>{
    if (!req.user) {
        return res.redirect('/signup');
    }
    var cart = await Cart.findOne({ userId: req.user.id});
    var orders = await Order.find({ user: req.user.id});
    let updated = []
    for (let i = 0; i < orders.length; i++) {
        let e = {
            id: orders[i].id,
            products: orders[i].products,
            totalamount: orders[i].totalamount,
            paymentmode: orders[i].paymentmode,
            // status: orders[i].status,
            date: formatDate(new Date(orders[i].orderdate))
        }
        updated.push(e)
    }
    var cartLength = cart.products.length;
    res.render('my_account',{
        title: 'My account',
        user: req.user,
        orders: updated,
        cartLength,
        storename: req.storename,
    });
});

module.exports = router;