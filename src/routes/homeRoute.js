const express = require('express');
const router = express.Router();

const checkUser = require('../middleware/authMiddleware');
const checkStore = require('../middleware/selectedStore');

// models
const Category = require('../models/category');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');

// home
router.get("/", checkUser, checkStore, async (req,res)=>{
    if (req.user) {
        var cart = await Cart.findOne({ userId: req.user.id, vendorId: req.store});
        var cartLength = cart.products.length;
    } else {
        const storeId = req.store;
        var cartLength = req.session.cart[storeId] ? req.session.cart[storeId].length : 0;
    }
    req.session.redirectToUrl = req.originalUrl;
    const search = req.query.search;
    if (search) {   // search page
        const searchString = search.trim();
        const regex = new RegExp(searchString.replace(/\s+/g,"\\s+"), "gi");

        const searchProds = await Product.find({ 'productname': { $regex: regex }, vendor: req.store });
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
        const prods = await Product.find({ featured: true, vendor: req.store });
        res.render("index",{
            title: "Home",
            user: req.user,
            storename: req.storename,
            cats,
            cartLength,
            prods
        });
    }
});

// autocomplete search api
router.get('/autocomplete', checkStore, async (req, res) => {
    const search = req.query.term;
    const searchString = search.trim();
    const regex = new RegExp(searchString.replace(/\s+/g,"\\s+"), "gi");
    const searchProds = await Product.find({ 'productname': { $regex: regex }, vendor: req.store });
    // res.json([{id: 1, name:'Product'},{id: 2, name:'Product2'}]);
    res.json(searchProds);
});

module.exports = router;