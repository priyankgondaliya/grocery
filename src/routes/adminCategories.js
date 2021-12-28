const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const multer  = require('multer');
const fs = require('fs-extra');
const formatDate = require('../helpers/formateDate');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './public/uploads/category/');
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

// GET categoty model
const Category = require('../models/category');

// GET category
router.get("/", async (req,res)=>{
    const cats = await Category.find();
    let updated = []
    for (let i = 0; i < cats.length; i++) {
        let e = {
            id: cats[i]._id,
            name: cats[i].name,
            tax: cats[i].tax,
            image: cats[i].image,
            date: formatDate(new Date(cats[i].date))
        }
        updated.push(e)
    }
    res.status(201).render("admin/category", {
        title: 'Category List',
        cats: updated
    });
});

// GET add category
router.get("/add", (req,res)=>{
    res.status(201).render("admin/add_category", {
        title: 'Add Category'
    });
});

// POST add category
router.post('/add', upload.single('image'), [
    check('name','Category name must have a value').notEmpty(),
    check('tax','Category tax must have a value').notEmpty(),
],async (req,res) => {
    try {
        const {name, tax} = req.body;
        const validationErrors = validationResult(req)
        if (validationErrors.errors.length > 0) {
            const alert = validationErrors.array()
            return res.render('admin/add_category', {
                title: 'Add Category',
                alert
            })
        }
        const image = req.file.path.replace(/\\/g,"/").replace('public','');
        const cat = new Category({
            name,
            tax,
            image
        })
        await cat.save();
        req.flash('success',`Category added successfully`);
        res.redirect('/admin/category')
    } catch (error) {
        console.log(error.message);
        if (error.code == 11000) {
            req.flash('danger',`Category name '${req.body.name}' already exist!`);
            res.redirect('/admin/category');
        } else {
            res.send(error.message);
            console.log(error);
        }
    }   
});

// GET edit category
router.get("/edit/:id", async (req,res)=>{
    try {
        const id = req.params.id;
        const cat = await Category.findById(id);
        res.status(201).render("admin/edit_category", {
            title: 'Edit Category',
            cat
        });
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('danger',`Category not found!`);
            res.redirect('/admin/category');
        } else {
            console.log(error);
            res.send(error)
        }
    }
});

// POST Edit category
router.post('/edit/:id', upload.single('image'), [
    check('name','Category name must have a value').notEmpty(),
    check('tax','Category tax must have a value').notEmpty(),
],async (req,res) => {
    try {
        const {name, tax} = req.body;
        const validationErrors = validationResult(req)
        if (validationErrors.errors.length > 0) {
            const alert = validationErrors.array()
            return res.render('admin/edit_category', {
                title: 'Edit Category',
                alert
            })
        }
        const id = req.params.id;
        const cat = await Category.findById(id);
        cat.name = name;
        cat.tax = tax;
        if (typeof req.file !== 'undefined') {
            oldImage = "public" + cat.image;
            fs.remove(oldImage, function (err) {
                if (err) { console.log(err); }
            })
            const image = req.file.path.replace(/\\/g,"/").replace('public','');
            cat.image = image;
        }
        await cat.save();
        req.flash('success',`Category Edited successfully`);
        res.redirect('/admin/category')
    } catch (error) {
        console.log(error.message);
        if (error.code == 11000) {
            req.flash('danger',`Category name '${req.body.name}' already exist!`);
            res.redirect(`/admin/category/edit/${req.params.id}`);
        } else if (error.name === 'CastError') {
            req.flash('danger',`Category not found!`);
            res.redirect('/admin/category');
        } else {
            res.send(error.message);
            console.log(error);
        }
    }   
});

// GET delete category
router.get("/delete/:id", async (req,res)=>{
    try {
        const id = req.params.id;
        const cat = await Category.findByIdAndRemove(id);
        image = "public" + cat.image;
        fs.remove(image, function (err) {
            if (err) { console.log(err); }
        })
        req.flash('success',`Category Deleted successfully`);
        res.redirect('/admin/category')
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('danger',`Category not found!`);
            res.redirect('/admin/category');
        } else {
            console.log(error);
            res.send(error)
        }
    }
});

//exports
module.exports = router;