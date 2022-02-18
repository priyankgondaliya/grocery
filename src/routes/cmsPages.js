const express = require('express');
const router = express.Router();
const Page = require('../models/pageModel');
const { check, validationResult } = require('express-validator');

// const Contact = require('../models/contactDetailModel');
const Message = require('../models/messageModel');
const checkUser = require('../middleware/authMiddleware');
const Cart = require('../models/cartModel');

// about us
router.get("/about_us", checkUser, async (req,res)=>{
    try {
        if (req.user) {
            var cart = await Cart.findOne({ userId: req.user.id});
            var cartLength = cart.products.length;
        } else {
            var cartLength = req.session.cart.products.length;
        }
        const page = await Page.findOne({ title:'About Us'})
        const content = page.content;
        res.status(201).render("cms", {
            title: 'About Us',
            user: req.user,
            cartLength,
            content
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("An error occured")
    }
});

// faqs
router.get("/faqs", checkUser, async (req,res)=>{
    try {
        if (req.user) {
            var cart = await Cart.findOne({ userId: req.user.id});
            var cartLength = cart.products.length;
        } else {
            var cartLength = req.session.cart.products.length;
        }
        const page = await Page.findOne({ title:'FAQs'})
        const content = page.content;
        res.status(201).render("cms", {
            title: 'FAQs',
            user: req.user,
            cartLength,
            content
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("An error occured")
    }
});

// terms
router.get("/terms_con", checkUser, async (req,res)=>{
    try {
        if (req.user) {
            var cart = await Cart.findOne({ userId: req.user.id });
            var cartLength = cart.products.length;
        } else {
            var cartLength = req.session.cart.products.length;
        }
        const page = await Page.findOne({ title: 'Terms & Conditions' })
        const content = page.content;
        res.status(201).render("cms", {
            title: 'Terms & Conditions',
            user: req.user,
            cartLength,
            content
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("An error occured")
    }
});

// privacy
router.get("/privacy_policy", checkUser, async (req,res)=>{
    try {
        if (req.user) {
            var cart = await Cart.findOne({ userId: req.user.id});
            var cartLength = cart.products.length;
        } else {
            var cartLength = req.session.cart.products.length;
        }
        const page = await Page.findOne({ title:'Privacy Policy'})
        const content = page.content;
        res.status(201).render("cms", {
            title:'Privacy Policy',
            user: req.user,
            cartLength,
            content
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("An error occured")
    }
});

// contact
router.get("/contact", checkUser, async (req,res)=>{
    try {
        if (req.user) {
            var cart = await Cart.findOne({ userId: req.user.id});
            var cartLength = cart.products.length;
        } else {
            var cartLength = req.session.cart.products.length;
        }
        const page = await Page.findOne({ title:'Contact'})
        const content = page.content;
        // const contact = await Contact.findOne()
        res.status(201).render("contact", {
            title: 'Contact Us',
            user: req.user,
            cartLength,
            content,
            // contact
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("An error occured")
    }
});

// POST message
router.post("/contact",[
    check('name','Please enter your name.').notEmpty(),
    check('email','Please enter valid email.').isEmail(),
    check('address','Please enter address.').notEmpty(),
    check('phone','Please enter phone number.').notEmpty(),
    check('message','Please enter a message.').notEmpty(),
  ], checkUser, async(req,res)=>{
    try {
        if (req.user) {
            var cart = await Cart.findOne({ userId: req.user.id});
            var cartLength = cart.products.length;
        } else {
            var cartLength = req.session.cart.products.length;
        }
        const page = await Page.findOne({ title:'Contact'})
        const content = page.content;
        const validationErrors = validationResult(req)
        if (validationErrors.errors.length > 0) {
            const alert = validationErrors.array()
            return res.render('contact', {
                title: 'Contact Us',
                alert,
                user: req.user,
                cartLength,
                content
            })
        }
        const message = new Message({
            name : req.body.name,
            email : req.body.email,
            address : req.body.address,
            phone : req.body.phone,
            message: req.body.message
        })
        await message.save();
        res.status(201).render("contact", {
            title: 'Contact Us',
            alert: [{msg:'Message sent successfully.'}],
            content
        });
    } catch (error) {
        res.status(400).send(error.message);
        console.log(error);
    }
})

module.exports = router;