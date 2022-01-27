const express = require('express');
const router = express.Router();
const fs = require('fs-extra');

const Product = require('../models/productModel');
const Offer = require('../models/offerModel');
const Category = require('../models/category');
const Subcategory = require('../models/subcategory');
const Unit = require('../models/unitModel');

// const formatDate = require('../helpers/formateDate');

// GET dashboard
router.get("/", async (req,res)=>{
    res.render('admin/admin_dashboard',{
        title: 'Dashboard'
    })
})

// GET products
router.get("/product", async (req,res)=>{
    const products = await Product.find();
    res.status(201).render("admin/products", {
        title: 'Product List',
        products
    });
});

// GET product detail
router.get("/product/detail/:id", async (req,res)=>{
    try {
        const id = req.params.id;
        const product = await Product.findById(id);
        const category = await Category.findById(product.category);
        const subcategory = await Subcategory.findById(product.subcategory);
        const unit = await Unit.findById(product.unit);
        res.status(201).render("admin/product_detail", {
            title: 'Product Details',
            product,
            cat: category.name,
            subcat: subcategory.name,
            unit: unit.name
        });
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('danger',`Product not found!`);
            res.redirect('/admin/product');
        } else {
            console.log(error);
            res.send(error)
        }
    }
});

// GET delete product
router.get("/product/delete/:id", async (req,res)=>{
    try {
        const id = req.params.id;
        const product = await Product.findByIdAndRemove(id);
        image = "public" + product.image;
        fs.remove(image, function (err) {
            if (err) { console.log(err); }
        })
        req.flash('success',`Product Deleted successfully`);
        res.redirect('/admin/product')
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('danger',`Product not found!`);
            res.redirect('/admin/product');
        } else {
            console.log(error);
            res.send(error)
        }
    }
});

// GET offers
router.get("/offer", async (req,res)=>{
    const offers = await Offer.find();
    res.status(201).render("admin/offers", {
        title: 'Offer List',
        offers
    });
});

// GET product detail
router.get("/offer/detail/:id", async (req,res)=>{
    try {
        const id = req.params.id;
        const offer = await Offer.findById(id);
        const category = await Category.findById(offer.category);
        const subcategory = await Subcategory.findById(offer.subcategory);
        const unit = await Unit.findById(offer.unit);
        res.status(201).render("admin/offer_detail", {
            title: 'Offer Details',
            offer,
            cat: category.name,
            subcat: subcategory.name,
            unit: unit.name
        });
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('danger',`Offer not found!`);
            res.redirect('/admin/offer');
        } else {
            console.log(error);
            res.send(error)
        }
    }
});

// GET delete offer
router.get("/offer/delete/:id", async (req,res)=>{
    try {
        const id = req.params.id;
        const offer = await Offer.findByIdAndRemove(id);
        image = "public" + offer.image;
        fs.remove(image, function (err) {
            if (err) { console.log(err); }
        })
        req.flash('success',`Offer Deleted successfully`);
        res.redirect('/admin/offer')
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('danger',`Offer not found!`);
            res.redirect('/admin/offer');
        } else {
            console.log(error);
            res.send(error)
        }
    }
});

// GET order
router.get("/orders", (req,res)=>{
    res.status(201).render("admin/orders",{
        title: 'Order List',
    });
});

module.exports = router;