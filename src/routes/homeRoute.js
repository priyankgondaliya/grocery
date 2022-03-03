const express = require('express');
const { serializeUser } = require('passport');
const router = express.Router();

const checkUser = require('../middleware/authMiddleware');

// models
const Category = require('../models/category');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');

// home
router.get("/", checkUser, async (req,res)=>{
    if (req.user) {
        var cart = await Cart.findOne({ userId: req.user.id});
        console.log("cart: ");
        console.log(cart);
        var cartLength = cart.products.length;
    } else {
        var cartLength = req.session.cart.products.length;
    }
    req.session.redirectToUrl = req.originalUrl;
    const searchString = req.query.search;
    if (searchString) {
        console.log(searchString);
        const regex = new RegExp(searchString.replace(/\s+/g,"\\s+"), "gi");

        const searchProds = await Product.find({ 'productname': { $regex: regex }});
        console.log(searchProds.length);

        const searchCats = await Category.find({ 'name': { $regex: regex }});
        console.log(searchCats.length);
    }
    const cats = await Category.find({ featured: true });
    const prods = await Product.find({ featured: true });
    res.render("index",{
        title: "Home",
        user: req.user,
        cats,
        cartLength,
        prods
    });
});

module.exports = router;