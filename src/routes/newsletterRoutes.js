const express = require('express');
const router = express.Router();
const Newsletter = require('../models/newsletterModel');
const { check, validationResult } = require('express-validator');

// POST newsletter
router.post("/", [
    check('email','Please enter valid email.').isEmail(),
  ], async(req,res)=>{
    try {
        const validationErrors = validationResult(req)
        if (validationErrors.errors.length > 0) {
            req.flash('danger', 'Please enter valid email.')
            return res.redirect('/')
        }
        const { email } = req.body;
        const emailExist = await Newsletter.findOne({email});
        if (emailExist) {
            req.flash('warning', 'Email in already in our newsletter list.')
            return res.redirect('/')
        }
        const newsletter = new Newsletter({email});
        await newsletter.save();
        req.flash('success', 'Email added in our newsletter list.')
        res.redirect('/')
    } catch (error) {
        res.status(400).send(error.message);
        console.log(error);
    }
})

module.exports = router;