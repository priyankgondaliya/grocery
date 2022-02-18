const express = require('express');
const router = express.Router();

const checkUser = require('../middleware/authMiddleware');

// models
const Category = require('../models/category');
const Subcategory = require('../models/subcategory');
const Product = require('../models/productModel');
const Unit = require('../models/unitModel');
const Cart = require('../models/cartModel');

//GET all products
router.get('/', checkUser, async function(req,res){
    if (req.user) {
        var cart = await Cart.findOne({ userId: req.user.id});
        var cartLength = cart.products.length;
    } else {
        var cartLength = req.session.cart.products.length;
    }
    req.session.redirectToUrl = req.originalUrl;
    const cats = await Category.find();
    const subcats = await Subcategory.find();
    const prods = await Product.find();
    res.render('all_products',{
        title:'All products',
        subcats,
        cats,
        prods,
        cartLength,
        user: req.user
    });
});

// product detail
router.get('/detail/:id', checkUser, async function(req,res){
    req.session.redirectToUrl = req.originalUrl;
    try {
        if (req.user) {
            var cart = await Cart.findOne({ userId: req.user.id});
            var cartLength = cart.products.length;
        } else {
            var cartLength = req.session.cart.products.length;
        }
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
            unit: unit.name,
            cartLength,
            user: req.user
        });
    } catch (error) {
        console.log(error);        
    }
});

//GET products by category
router.get('/:cat/:sub?', checkUser, async function(req,res){
    if (req.user) {
        var cart = await Cart.findOne({ userId: req.user.id});
        var cartLength = cart.products.length;
    } else {
        var cartLength = req.session.cart.products.length;
    }
    req.session.redirectToUrl = req.originalUrl;
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
        prods,
        cartLength,
        user: req.user
    });
});

module.exports = router;