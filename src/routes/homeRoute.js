const express = require('express');
const router = express.Router();

// models
const Category = require('../models/category');

// home
router.get("/",async (req,res)=>{
    const cats = await Category.find();
    res.render("index",{
        title: "Home",
        cats
    });
});

module.exports = router;