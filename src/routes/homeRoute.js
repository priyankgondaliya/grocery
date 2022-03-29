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
        var cartLength = cart.products.length;
    } else {
        var cartLength = req.session.cart.products.length;
    }
    req.session.redirectToUrl = req.originalUrl;
    const search = req.query.search;
    if (search) {   // search page
        const searchString = search.trim();
        const regex = new RegExp(searchString.replace(/\s+/g,"\\s+"), "gi");

        const searchProds = await Product.find({ 'productname': { $regex: regex }});
        const searchCats = await Category.find({ 'name': { $regex: regex }});

        const allcats = await Category.find();
        const cats = await Category.find({ featured: true });
        res.render("search",{
            title: `Search for ${searchString}`,
            user: req.user,
            cartLength,
            cats,
            allcats,
            searchString,
            searchCats,
            searchProds
        });
    } else {    // homepage
        const cats = await Category.find({ featured: true });
        const prods = await Product.find({ featured: true });
        res.render("index",{
            title: "Home",
            user: req.user,
            cats,
            cartLength,
            prods
        });
    }
});

router.get('/autocomplete', async (req, res) => {
    const search = req.query.term;
    const searchString = search.trim();
    const regex = new RegExp(searchString.replace(/\s+/g,"\\s+"), "gi");
    const searchProds = await Product.find({ 'productname': { $regex: regex }});
    // res.json([{id: 1, name:'Product'},{id: 2, name:'Product2'}]);
    res.json(searchProds);
});

module.exports = router;