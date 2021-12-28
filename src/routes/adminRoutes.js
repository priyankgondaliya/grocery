const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const Offer = require('../models/offerModel');
const fs = require('fs-extra');

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

// GET delete product
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

// GET promo
router.get("/promo", (req,res)=>{
    res.status(201).render("admin/promo",{
        title: 'Promocode',
    });
});

// GET order
router.get("/orders", (req,res)=>{
    res.status(201).render("admin/orders",{
        title: 'Order List',
    });
});

module.exports = router;