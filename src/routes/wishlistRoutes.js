const express = require('express');
const router = express.Router();

const checkUser = require('../middleware/authMiddleware');

const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');

// GET wishlist
router.get("/", checkUser, async (req,res)=>{
    if (!req.user) {
        req.session.redirectToUrl = req.originalUrl;
        return res.redirect('/signup');
    }
    req.session.redirectToUrl = req.originalUrl;
    var cart = await Cart.findOne({ userId: req.user.id});
    var cartLength = cart.products.length;
    const wishlist = req.user.wishlist;
    let items = [];
    for (let i = 0; i < wishlist.length; i++) {
        let p = await Product.findById(wishlist[i]);
        items.push(p);
    }
    res.status(201).render("wishlist", {
        title: 'Wishlist',
        items,
        cartLength,
        user: req.user
    });
});

// GET add wishlist
router.get("/add/:id", checkUser, async (req,res)=>{
    if(!req.user){
        return res.redirect('/signup');
    }
    try {
        const p = await Product.findById(req.params.id);
        if (p == null) {
            // given id is not a product
            console.log("Invalid product id");
            return res.redirect('/wishlist');
        }
        const user = await User.findById(req.user.id);
        if (!user.wishlist.includes(req.params.id)) {
            user.wishlist.push(req.params.id);
            await user.save();
        }
        const redirect = req.session.redirectToUrl;
        req.session.redirectToUrl = undefined;
        res.redirect(redirect || '/wishlist');
    } catch (error) {
        console.log(error);        
    }
});

// GET remove wishlist api
router.get("/remove/:id", checkUser, async (req,res)=>{
    if (!req.user) {
        return res.redirect('/signup');
    }
    try {
        const user = await User.findById(req.user.id);
        if (req.params.id == 'all') {
            user.wishlist = [];
        } else {
            user.wishlist = user.wishlist.filter((value) => value != req.params.id);
        }
        await user.save();

        const redirect = req.session.redirectToUrl;
        req.session.redirectToUrl = undefined;
        res.redirect(redirect || '/wishlist');
    } catch (error) {
        console.log(error);        
    }
});

// GET add wishlist api
router.get("/api/add/:id", checkUser, async (req,res)=>{
    if(!req.user){
        return res.json({ status: "fail" })
    }
    try {
        const p = await Product.findById(req.params.id);
        if (p == null) {
            // given id is not a product
            console.log("Invalid product id");
            return res.json({ status: "fail" })
        }
        const user = await User.findById(req.user.id);
        if (!user.wishlist.includes(req.params.id)) {
            user.wishlist.push(req.params.id);
            await user.save();
        }
        res.json({ status: "success" })
    } catch (error) {
        console.log(error);        
    }
});

// GET remove wishlist api
router.get("/api/remove/:id", checkUser, async (req,res)=>{
    if (!req.user) {
        return res.json({ status: "fail" })
    }
    try {
        const user = await User.findById(req.user.id);
        if (req.params.id == 'all') {
            user.wishlist = [];
        } else {
            user.wishlist = user.wishlist.filter((value) => value != req.params.id);
        }
        await user.save();

        res.json({ status: "success" })
    } catch (error) {
        console.log(error);        
    }
});

module.exports = router;