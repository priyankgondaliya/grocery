const express = require('express');
const router = express.Router();

const checkUser = require('../middleware/authMiddleware');

const User = require('../models/userModel');
const Product = require('../models/productModel');

// GET wishlist
router.get("/", checkUser, async (req,res)=>{
    if(!req.user){
        req.session.redirectToUrl = req.originalUrl;
        return res.redirect('/signup');
    }
    const wishlist = req.user.wishlist;
    let items = [];
    for (let i = 0; i < wishlist.length; i++) {
        let p = await Product.findById(wishlist[i]);
        items.push(p);
    }
    res.status(201).render("wishlist", {
        title: 'Wishlist',
        items
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
        res.redirect('/wishlist');
    } catch (error) {
        console.log(error);        
    }
});

// GET remove wishlist
router.get("/remove/:id", checkUser, async (req,res)=>{
    if(!req.user){
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
    
        res.redirect('/wishlist');
    } catch (error) {
        console.log(error);        
    }
});

// TODO
// do not redirect
// create api and fetch via frontend js

// 61c441a15ca0451bb0896aeb
// 61c45740dea27764addb5c91

module.exports = router;