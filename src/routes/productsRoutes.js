const express = require('express');
const router = express.Router();

const checkUser = require('../middleware/authMiddleware');
const checkStore = require('../middleware/selectedStore');

// models
const Category = require('../models/category');
const Subcategory = require('../models/subcategory');
const Product = require('../models/productModel');
const Unit = require('../models/unitModel');
const Cart = require('../models/cartModel');

// product detail
router.get('/detail/:id', checkUser, checkStore, async function(req,res){
    req.session.redirectToUrl = req.originalUrl;
    try {
        if (req.user) {
            var cart = await Cart.findOne({ userId: req.user.id});
            var cartLength = cart.products.length;
        } else {
            var cartLength = req.session.cart.products.length;
        }
        const id = req.params.id;
        const product = await Product.findOne({_id: id, vendor: req.store});
        const category = await Category.findById(product.category);
        const subcategory = await Subcategory.findById(product.subcategory);
        const unit = await Unit.findById(product.unit);
        res.render('product_detail',{
            // title:'Product detail',
            title: product.productname,
            product,
            cat: category.name,
            subcat: subcategory.name,
            unit: unit ? unit.name : "" ,
            cartLength,
            storename: req.storename,
            user: req.user
        });
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError') {
            res.redirect('/404');
        } else {
            console.log(error);
            res.send(error)
        }
    }
});

//GET products by category
router.get('/:cat/:sub?', checkUser, checkStore, async function(req,res){
    try {
        if (req.user) {
            var cart = await Cart.findOne({ userId: req.user.id});
            var cartLength = cart.products.length;
        } else {
            var cartLength = req.session.cart.products.length;
        }
        req.session.redirectToUrl = req.originalUrl;
        const {cat, sub} = req.params;
        if (sub == undefined) {
            const cats = await Category.find();
            if (cat == 'all') {
                var subcats = await Subcategory.find();
                var prods = await Product.find({vendor: req.store});
                var SubcatOf = `total`;
                var ProdOf = `total`;
            } else {
                var subcats = await Subcategory.find({category: cat});
                var prods = await Product.find({category: cat, vendor: req.store});
                const category = await Category.findById(cat);
                const catName = category.name;
                var SubcatOf = `of ${catName}`;
                var ProdOf = `of ${catName}`;
            }
            res.render('all_products',{
                title:'Products page',
                subcats,
                cats,
                prods,
                SubcatOf,
                ProdOf,
                cartLength,
                storename: req.storename,
                user: req.user
            });
        } else {
            var prods = await Product.find({subcategory: sub, vendor: req.store});
            const subcategory = await Subcategory.findById(sub);
            const subName = subcategory.name;
            var ProdOf = `of ${subName}`;
            res.render('products_per_subcat',{
                title:'Products page',
                prods,
                ProdOf,
                cartLength,
                storename: req.storename,
                user: req.user
            });
        }   
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError') {
            console.log(error);
            res.redirect('/404');
        } else {
            console.log(error);
            res.send(error)
        }
    }
});

module.exports = router;