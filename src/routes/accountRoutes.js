const express = require('express');
const router = express.Router();

const checkUser = require('../middleware/authMiddleware');

const Cart = require('../models/cartModel');

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

router.get("/account", checkUser, async (req,res)=>{
    if (!req.user) {
        return res.redirect('/signup');
    }
    var cart = await Cart.findOne({ userId: req.user.id});
    var cartLength = cart.products.length;
    res.render('my_account',{
        title: 'My account',
        user: req.user,
        cartLength
    });
});

module.exports = router;