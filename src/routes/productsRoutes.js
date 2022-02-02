const express = require('express');
const router = express.Router();

// models
const Category = require('../models/category');
const Subcategory = require('../models/subcategory');
const Product = require('../models/productModel');
const Unit = require('../models/unitModel');

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

// product detail
router.get('/detail/:id',async function(req,res){
    try {
        const id = req.params.id;
        const product = await Product.findById(id);
        const category = await Category.findById(product.category);
        const subcategory = await Subcategory.findById(product.subcategory);
        const unit = await Unit.findById(product.unit);
        res.render('product_detail',{
            // title:'Product detail',
            title: product.productname,
            product,
            cat: category.name,
            subcat: subcategory.name,
            unit: unit.name
        });
    } catch (error) {
        console.log(error);        
    }
});

//GET products by category
router.get('/:cat/:sub?',async function(req,res){
    const {cat, sub} = req.params;
    if (sub == undefined) {
        if (cat == 'all') {
            var subcats = await Subcategory.find();
            var prods = await Product.find();
        } else {
            var subcats = await Subcategory.find({category: cat});
            var prods = await Product.find({category: cat});
        }
    } else {
        var subcats = await Subcategory.find({category: cat});
        var prods = await Product.find({subcategory: sub});
    }
    const cats = await Category.find();
    res.render('all_products',{
        title:'All products',
        subcats,
        cats,
        prods
    });
});

module.exports = router;