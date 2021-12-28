const express = require('express');
const router = express.Router();
const Message = require('../models/messageModel');
const Page = require('../models/pageModel');
const { check, validationResult } = require('express-validator');

// POST message
router.post("/contact",[
    check('name','Please enter your name.').notEmpty(),
    check('email','Please enter valid email.').isEmail(),
    check('address','Please enter address.').notEmpty(),
    check('phone','Please enter phone number.').notEmpty(),
    check('message','Please enter a message.').notEmpty(),
  ],async(req,res)=>{
    try {
        const page = await Page.findOne({ title:'Contact'})
        const content = page.content;
        const validationErrors = validationResult(req)
        // console.log(validationErrors.errors);
        if (validationErrors.errors.length > 0) {
            const alert = validationErrors.array()
            return res.render('contact', {
                title: 'Contact Us',
                alert,
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