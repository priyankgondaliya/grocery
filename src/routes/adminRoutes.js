const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const { check, validationResult } = require('express-validator');
const bcrypt = require("bcryptjs");
const formatDate = require('../helpers/formateDate');

const checkAdmin = require('../middleware/authAdminMiddleware');

const User = require('../models/userModel');
const Product = require('../models/productModel');
const Offer = require('../models/offerModel');
const Category = require('../models/category');
const Subcategory = require('../models/subcategory');
const Unit = require('../models/unitModel');
const Order = require('../models/orderModel');

// const formatDate = require('../helpers/formateDate');

// GET dashboard
router.get("/", checkAdmin, async (req,res)=>{
    res.render('admin/admin_dashboard',{
        title: 'Dashboard'
    })
})

// GET login
router.get('/login', (req, res)=>{
    res.render('admin/login',{
        title: 'Admin Login'
    })
})

// POST login
router.post("/login", [
    check('email','Please enter valid email.').isEmail(),
    check('password','Please enter password!').notEmpty(),
  ],async(req, res)=>{
    try {
        const validationErrors = validationResult(req)
        if (validationErrors.errors.length > 0) {
            req.flash('danger','Invalid email or password!');
            return res.redirect('/admin/login');
        }
        const { email, password } = req.body;
        const userExist = await User.findOne({email});
        if (!userExist) {
            req.flash('danger','Invalid email or password!');
            return res.redirect('/admin/login');
        }
        const isMatch = await bcrypt.compare(password, userExist.password);
        if (!isMatch) {
            req.flash('danger','Invalid email or password!');
            return res.redirect('/admin/login');
        }
        const token = await userExist.generateAuthToken();
        res.cookie("jwtAdmin", token, {
            expires:new Date( Date.now() + 90*24*60*60*1000 ),
            httpOnly:true,
            // secure:true
        });
        res.redirect('/admin');
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
})

// GET products
router.get("/product", checkAdmin, async (req,res)=>{
    const products = await Product.find();
    res.status(201).render("admin/products", {
        title: 'Product List',
        products
    });
});

// GET product detail
router.get("/product/detail/:id", checkAdmin, async (req,res)=>{
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

// featured product
router.post("/product/edit/:id", checkAdmin, async (req,res) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id);
        if (req.body.featured) {
            product.featured = true;
        } else {
            product.featured = false;
        }
        await product.save();
        req.flash('success','Product edited successfully.')
        res.redirect('/admin/product');
    } catch (error) {
        if (error.name === 'CastError') {
            console.log(error);
            req.flash('danger',`Product not found!`);
            res.redirect('/admin/Product');
        } else {
            console.log(error);
            res.send(error.message)
        }
    }
})

// GET delete product
router.get("/product/delete/:id", checkAdmin, async (req,res)=>{
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
router.get("/offer", checkAdmin, async (req,res)=>{
    const offers = await Offer.find();
    res.status(201).render("admin/offers", {
        title: 'Offer List',
        offers
    });
});

// GET offer detail
router.get("/offer/detail/:id", checkAdmin, async (req,res)=>{
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
router.get("/offer/delete/:id", checkAdmin, async (req,res)=>{
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
router.get("/order", checkAdmin, async (req,res)=>{
    var orders = await Order.find();
    let updated = []
    for (let i = 0; i < orders.length; i++) {
        let user = await User.findById(orders[i].user);
        let username = `${user.firstname} ${user.lastname}`
        let e = {
            username,
            id: orders[i].id,
            useraddress: orders[i].useraddress,
            totalamount: orders[i].totalamount,
            deliverycharge: orders[i].deliverycharge,
            deliveryrange: orders[i].deliveryrange,
            deliveryrange: orders[i].deliveryrange,
            payableamount: orders[i].payableamount,
            discountamount: orders[i].discountamount,
            cashback: orders[i].cashback,
            paymentmode: orders[i].paymentmode,
            // status: orders[i].status,
            date: formatDate(new Date(orders[i].orderdate))
        }
        updated.push(e)
    }
    // console.log(updated);
    res.status(201).render("admin/orders",{
        title: 'Order List',
        orders: updated
    });
});

// GET order detail
router.get("/order/detail/:id", checkAdmin, async (req,res)=>{
    try {
        const id = req.params.id;
        const order = await Order.findById(id);
        let updated = [];
        for (let i = 0; i < order.products.length; i++) {
            let product = await Product.findById(order.products[i].productId);
            let unit = await Unit.findById(product.unit);
            let e = {
                image: product.image,
                name: order.products[i].name,
                quantity: order.products[i].quantity,
                weight: order.products[i].weight,
                price: order.products[i].price,
                unit: unit.name,
            }
            updated.push(e)
        }
        res.status(201).render("admin/order_detail", {
            title: 'Order Details',
            // offer,
            updated,
        });
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('danger',`Order not found!`);
            res.redirect('/admin/order');
        } else {
            console.log(error);
            res.send(error)
        }
    }
});

module.exports = router;