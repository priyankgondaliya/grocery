const express = require('express');
const router = express.Router();

const checkUser = require('../middleware/authMiddleware');

// models
const Category = require('../models/category');
const Product = require('../models/productModel');

// home
router.get("/", checkUser, async (req,res)=>{
    const cats = await Category.find({ featured: true });
    const prods = await Product.find({ featured: true });
    res.render("index",{
        title: "Home",
        user: req.user,
        cats,
        prods
    });
});

module.exports = router;