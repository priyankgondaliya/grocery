const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const multer  = require('multer');
const fs = require('fs-extra');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './public/uploads/offer/');
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

// models
const Category = require('../models/category');
const Subcategory = require('../models/subcategory');
const Unit = require('../models/unitModel');
// const Product = require('../models/productModel');
const Offer = require('../models/offerModel');

// GET offers
router.get("/", async (req,res)=>{
    const offers = await Offer.find();
    res.status(201).render("vendor/vendor_offers", {
        title: 'Offer List',
        offers
    });
});

// GET add offer
router.get("/add", async (req,res)=>{
    const cats = await Category.find();
    let array = {}
    for (let i = 0; i < cats.length; i++) {
        const subcats = await Subcategory.find({category: cats[i].id});
        array[cats[i].id] = subcats
    }
    const units = await Unit.find();
    res.status(201).render("vendor/add_offer", {
        title: 'Add Offer',
        cats,
        units,
        array : array
    });
});

// Post new offer
router.post("/add", upload.single('image'), [
    check('category','Please enter category.').notEmpty(),
    check('productName','Please enter productName.').notEmpty(),
    check('type','Please enter type.').notEmpty(),
    check('costPrice','Please enter costPrice.').notEmpty(),
    check('salePrice','Please enter salePrice.').notEmpty(),
    check('discount','Please enter Discount.').notEmpty(),
  ], async (req,res)=>{
    try {
        const validationErrors = validationResult(req)
        if (validationErrors.errors.length > 0) {
            const alert = validationErrors.array()
            return res.render('vendor/add_offers', {
                title: 'Add Offer',
                alert
            })
        }
        const image = req.file.path.replace(/\\/g,"/").replace('public','');
        const offer = new Offer({
            category : req.body.category,
            subcategory : req.body.subCategory,
            company : req.body.company,
            productname : req.body.productName,
            type : req.body.type,
            productweight : req.body.productWeight,
            unit : req.body.unit,
            costprice : req.body.costPrice,
            saleprice : req.body.salePrice,
            discount : req.body.discount,
            nondisc : req.body.nondisc,
            totalprice : req.body.totalPrice,
            image : image,
            title1 : req.body.title1,
            title2 : req.body.title2,
            title3 : req.body.title3,
            title4 : req.body.title4,
            description1 : req.body.description1,
            description2 : req.body.description2,
            description3 : req.body.description3,
            description4 : req.body.description4,
        })
        await offer.save();
        req.flash('success',`Offer added successfully`);
        res.redirect('/vendor/offer');
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
})

// GET edit offer
router.get("/edit/:id", async (req,res)=>{
    try {
        const id = req.params.id;
        const offer = await Offer.findById(id);
        const cats = await Category.find();
        let array = {}
        for (let i = 0; i < cats.length; i++) {
            const subcats = await Subcategory.find({category: cats[i].id});
            array[cats[i].id] = subcats
        }
        const units = await Unit.find();
        res.status(201).render("vendor/edit_offer", {
            title: 'Edit Offer',
            offer,
            cats,
            units,
            array : array
        });
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('danger',`Offer not found!`);
            res.redirect('/vendor/offer');
        } else {
            console.log(error);
            res.send(error)
        }
    }
});

// POST edit offer
router.post('/edit/:id', upload.single('image'), [
    check('category','Please enter category.').notEmpty(),
    check('productName','Please enter productName.').notEmpty(),
    check('type','Please enter valid type.').notEmpty(),
    check('costPrice','Please enter valid costPrice.').notEmpty(),
    check('salePrice','Please enter valid salePrice.').notEmpty(),
    check('discount','Please enter Discount.').notEmpty(),
],async (req,res) => {
    try {
        const validationErrors = validationResult(req)
        if (validationErrors.errors.length > 0) {
            const alert = validationErrors.array()
            return res.render('vendor/add_offers', {
                title: 'Add Offer',
                alert
            })
        }
        const id = req.params.id;
        const offer = await Offer.findById(id);
        offer.category = req.body.category;
        offer.subcategory = req.body.subCategory;
        offer.company = req.body.company;
        offer.productname = req.body.productName;
        offer.type = req.body.type;
        offer.productweight = req.body.productWeight;
        offer.unit = req.body.unit;
        offer.costprice = req.body.costPrice;
        offer.saleprice = req.body.salePrice;
        offer.discount = req.body.discount;
        offer.nondisc = req.body.nondisc;
        offer.totalprice = req.body.totalPrice;
        offer.title1 = req.body.title1;
        offer.title2 = req.body.title2;
        offer.title3 = req.body.title3;
        offer.title4 = req.body.title4;
        offer.description1 = req.body.description1;
        offer.description2 = req.body.description2;
        offer.description3 = req.body.description3;
        offer.description4 = req.body.description4;
        if (typeof req.file !== 'undefined') {
            oldImage = "public" + offer.image;
            fs.remove(oldImage, function (err) {
                if (err) { console.log(err); }
            })
            const image = req.file.path.replace(/\\/g,"/").replace('public','');
            offer.image = image;
        }
        await offer.save();
        req.flash('success',`Offer Edited successfully`);
        res.redirect('/vendor/offer');
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('danger',`Offer not found!`);
            res.redirect('/vendor/offer');
        } else {
            console.log(error);
            res.send(error)
        }
    }   
});

// GET delete offer
router.get("/delete/:id", async (req,res)=>{
    try {
        const id = req.params.id;
        const offer = await Offer.findByIdAndRemove(id);
        image = "public" + offer.image;
        fs.remove(image, function (err) {
            if (err) { console.log(err); }
        })
        req.flash('success',`Offer Deleted successfully`);
        res.redirect('/vendor/offer');
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('danger',`Offer not found!`);
            res.redirect('/vendor/offer');
        } else {
            console.log(error);
            res.send(error)
        }
    }
});

//exports
module.exports = router;