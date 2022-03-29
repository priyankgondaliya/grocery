const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const checkAdmin = require('../middleware/authAdminMiddleware');

const sharp = require('sharp');
const multer  = require('multer');
const fs = require('fs-extra');

const Vendor = require('../models/vendorModel');

const storage = multer.memoryStorage();
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
router.get("/", checkAdmin, async (req,res)=>{
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
router.get("/add", checkAdmin, async (req,res)=>{
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
router.post("/add", checkAdmin, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'idImage', maxCount: 1 },
    { name: 'addImage', maxCount: 1 },
  ]), [
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
            return res.render('admin/add_vendor', {
                title: 'Add Vendor',
                alert
            })
        }
        const vendorExist = await Vendor.findOne({email: req.body.email})
        if (vendorExist) {
            return res.render('admin/add_vendor', {
                title: 'Add Vendor',
                alert: [{msg:'Vendor is already registerd with this Email.'}]
            })
        }
        const file1name = new Date().toISOString().replace(/:/g, '-') + req.files.image[0].originalname;
        const file2name = new Date().toISOString().replace(/:/g, '-') + req.files.idImage[0].originalname;
        const file3name = new Date().toISOString().replace(/:/g, '-') + req.files.addImage[0].originalname;
        const vendor = new Vendor({
            storename : req.body.storename,
            ownername : req.body.ownername,
            email : req.body.email,
            password : req.body.password,
            contact : req.body.contact,
            address : req.body.address,
            deliverycharge : req.body.deliverycharge,
            deliveryrange : req.body.deliveryrange,
            coords: {
                lat: req.body.lat,
                lng: req.body.lng
            }
        })
        vendor.image = `/uploads/vendor/${vendor.id}/` + file1name;
        vendor.idimage = `/uploads/vendor/${vendor.id}/` + file2name;
        vendor.addressimage = `/uploads/vendor/${vendor.id}/` + file3name;

        fs.access('./public/uploads/vendor', (err) => { if (err) fs.mkdirSync('./public/uploads/vendor'); });
        fs.access(`./public/uploads/vendor/${vendor.id}`, (err) => { if (err) fs.mkdirSync(`./public/uploads/vendor/${vendor.id}`); });
        await sharp(req.files.image[0].buffer)
            .toFile(`./public/uploads/vendor/${vendor.id}/`+file1name);
        await sharp(req.files.idImage[0].buffer)
            .toFile(`./public/uploads/vendor/${vendor.id}/`+file2name);
        await sharp(req.files.addImage[0].buffer)
            .toFile(`./public/uploads/vendor/${vendor.id}/`+file3name);
        
        await vendor.save();
        req.flash('success','Vendor added successfully')
        res.redirect('/admin/vendor');
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
})

// GET edit vendor
router.get("/edit/:id", checkAdmin, async (req,res)=>{
    try {
        const id = req.params.id;
        const vendor = await Vendor.findById(id);
        res.status(201).render("admin/edit_vendor", {
            title: 'Edit Vendor',
            vendor
        });
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('danger',`Vendor not found!`);
            res.redirect('/admin/vendor');
        } else {
            console.log(error);
            res.send(error)
        }
    }
});

// POST edit vendor
router.post("/edit/:id", checkAdmin, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'idImage', maxCount: 1 },
    { name: 'addImage', maxCount: 1 },
  ]), [
    check('storename','Please enter Store name.').notEmpty(),
    check('ownername','Please enter Owner name.').notEmpty(),
    check('contact','Plaese enter contact number.').notEmpty(),
    check('address','Plaese enter address.').notEmpty(),
  ],async (req,res)=>{
    try {
        const validationErrors = validationResult(req)
        if (validationErrors.errors.length > 0) {
            const alert = validationErrors.array()
            console.log(alert);
            return res.render('edit_vendor', {
                title: 'Edit Vendor',
                alert
            })
        }
        const id = req.params.id;
        const vendor = await Vendor.findById(id);
        vendor.storename = req.body.storename;
        vendor.ownername = req.body.ownername;
        vendor.contact = req.body.contact;
        vendor.address = req.body.address;
        vendor.deliverycharge = req.body.deliverycharge;
        vendor.deliveryrange = req.body.deliveryrange;
        vendor.coords =  {
            lat: req.body.lat,
            lng: req.body.lng
        }

        if (typeof req.files.image !== 'undefined') {
            oldImage = "public" + vendor.image;
            fs.remove(oldImage, function (err) {
                if (err) { console.log(err); }
            })
            const filename = new Date().toISOString().replace(/:/g, '-') + req.files.image[0].originalname;
            vendor.image = `/uploads/vendor/${vendor.id}/` + filename;
            fs.access(`./public/uploads/vendor/${vendor.id}`, (err) => { if (err) fs.mkdirSync(`./public/uploads/vendor/${vendor.id}`); });
            await sharp(req.files.image[0].buffer)
                .toFile(`./public/uploads/vendor/${vendor.id}/`+filename);
        }
        if (typeof req.files.idImage !== 'undefined') {
            oldImage = "public" + vendor.idimage;
            fs.remove(oldImage, function (err) {
                if (err) { console.log(err); }
            })
            const filename = new Date().toISOString().replace(/:/g, '-') + req.files.idImage[0].originalname;
            vendor.idimage = `/uploads/vendor/${vendor.id}/` + filename;
            fs.access(`./public/uploads/vendor/${vendor.id}`, (err) => { if (err) fs.mkdirSync(`./public/uploads/vendor/${vendor.id}`); });
            await sharp(req.files.idImage[0].buffer)
                .toFile(`./public/uploads/vendor/${vendor.id}/`+filename);
        }
        if (typeof req.files.addImage !== 'undefined') {
            oldImage = "public" + vendor.addressimage;
            fs.remove(oldImage, function (err) {
                if (err) { console.log(err); }
            })
            const filename = new Date().toISOString().replace(/:/g, '-') + req.files.addImage[0].originalname;
            vendor.addressimage = `/uploads/vendor/${vendor.id}/` + filename;
            fs.access(`./public/uploads/vendor/${vendor.id}`, (err) => { if (err) fs.mkdirSync(`./public/uploads/vendor/${vendor.id}`); });
            await sharp(req.files.addImage[0].buffer)
                .toFile(`./public/uploads/vendor/${vendor.id}/`+filename);
        }

        await vendor.save();
        req.flash('success','Vendor edited successfully.')
        res.redirect('/admin/vendor');
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('danger',`Vendor not found!`);
            res.redirect('/admin/vendor');
        } else {
            console.log(error);
            res.send(error)
        }
    }
});

// GET delete vendor
router.get("/delete/:id", checkAdmin, async (req,res)=>{
    try {
        const id = req.params.id;
        const vendor = await Vendor.findByIdAndRemove(id);

        fs.rmSync(`./public/uploads/vendor/${vendor.id}`, { recursive: true, force: true });
        
        req.flash('success',`Vendor Deleted successfully`);
        res.redirect('/admin/vendor');
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('danger',`Vendor not found!`);
            res.redirect('/admin/vendor');
        } else {
            console.log(error);
            res.send(error)
        }
    }
});

// GET vendors
router.get("/contact", checkAdmin, async (req,res)=>{
    try {
        const vendors = await Vendor.find();
        res.status(201).render("admin/vendorcontact", {
            title: 'Vendor List',
            vendors
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("An error occured")
    }
});

module.exports = router;