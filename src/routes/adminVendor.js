const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Vendor = require('../models/vendorModel');
const multer  = require('multer');
const fs = require('fs-extra');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './public/uploads/vendor/');
    },
    filename: function(req, file, cb) {
      cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(null, false);
    }
};
const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

// GET vendors
router.get("/vendor", async (req,res)=>{
    try {
        const vendors = await Vendor.find();
        res.status(201).render("admin/vendor", {
            title: 'Vendor List',
            vendors
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("An error occured")
    }
});

// GET add vendors
router.get("/vendor/add", async (req,res)=>{
    try {
        res.status(201).render("admin/add_vendor", {
            title: 'Add Vendor',
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("An error occured")
    }
});

// POST add vendor
router.post("/vendor/add", upload.single('image'), [
    check('storename','Please enter Store name.').notEmpty(),
    check('ownername','Please enter Owner name.').notEmpty(),
    check('email','Please enter valid email.').isEmail(),
    check('password','Password should be atleast 6 characters long.').isLength({ min: 6 }),
    check('contact','Plaese enter contact number.').notEmpty(),
    check('address','Plaese enter address.').notEmpty(),
  ],async(req,res)=>{
    try {
        const validationErrors = validationResult(req)
        if (validationErrors.errors.length > 0) {
            const alert = validationErrors.array()
            console.log(alert);
            return res.render('add_vendor', {
                title: 'Add Vendor',
                alert
            })
        }
        const vendorExist = await Vendor.findOne({email: req.body.email})
        if (vendorExist) {
            return res.render('add_vendor', {
                title: 'Add Vendor',
                alert: [{msg:'Vendor is already registerd with this Email.'}]
            })
        }
        const image = req.file.path.replace(/\\/g,"/").replace('public','');
        const vendor = new Vendor({
            storename : req.body.storename,
            ownername : req.body.ownername,
            email : req.body.email,
            password : req.body.password,
            contact : req.body.contact,
            address : req.body.address,
            deliverycharge : req.body.deliverycharge,
            image
        })
        await vendor.save();
        req.flash('success','Vendor added successfully')
        res.redirect('/admin/vendor');
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
})


module.exports = router;