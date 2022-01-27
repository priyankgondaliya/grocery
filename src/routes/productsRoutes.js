const express = require('express');
const router = express.Router();

// models
const Category = require('../models/category');
const Subcategory = require('../models/subcategory');
const Product = require('../models/productModel');

//GET all products
router.get('/',async function(req,res){
    const cats = await Category.find();
    const subcats = await Subcategory.find();
    res.render('all_products',{
        title:'All products',
        subcats,
        cats
    });
});

//GET products by category
router.get('/:cat',async function(req,res){
    const cats = await Category.find();
    const subcats = await Subcategory.find({category: req.params.cat});
    res.render('all_products',{
        title:'All products',
        subcats,
        cats
    });
});

module.exports = router;