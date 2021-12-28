const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const formatDate = require('../helpers/formateDate');
const fs = require('fs-extra');
const multer  = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './public/uploads/subcategory/');
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
const Subcategory = require('../models/subcategory');
const Category = require('../models/category');

// GET subcategory
router.get("/", async (req,res)=>{
    const cats = await Category.find();
    const subcats = await Subcategory.find();

    let updated = []
    for (let i = 0; i < subcats.length; i++) {
        let cat = cats.find(o => o.id == subcats[i].category);
        let e = {
            id: subcats[i]._id,
            name: subcats[i].name,
            category: cat.name,
            // categoryName: subcats[i].categoryName,
            image: subcats[i].image,
            date: formatDate(new Date(subcats[i].date))
        }
        updated.push(e)
    }
    res.status(201).render("admin/subcategory", {
        title: 'Subcategory List',
        subcats: updated
    });
});

// GET add subcategory
router.get("/add", async (req,res)=>{
    const cats = await Category.find();
    res.status(201).render("admin/add_subcategory", {
        title: 'Add Sub Category',
        cats
    });
});

// POST add subcategory
router.post('/add', upload.single('image'), [
    check('name','Sub category name must have a value').notEmpty(),
    check('category','Please select Category name').notEmpty(),
],async (req,res) => {
    try {
        const {name, category} = req.body;
        const validationErrors = validationResult(req)
        if (validationErrors.errors.length > 0) {
            const alert = validationErrors.array()
            const cats = await Category.find();
            return res.render('admin/add_subcategory', {
                title: 'Add Sub Category',
                alert,
                cats
            })
        }
        // const myArray = category.split("-");
        const image = req.file.path.replace(/\\/g,"/").replace('public','');
        const subcat = new Subcategory({
            name,
            category,
            // categoryName: myArray[1],
            image
        })
        await subcat.save();
        req.flash('success',`Sub Category added successfully`);
        res.redirect('/admin/subcategory')
    } catch (error) {
        console.log(error.message);
        if (error.code == 11000) {
            req.flash('danger',`Sub Category name '${req.body.name}' already exist!`);
            res.redirect('/admin/subcategory');
        } else {
            res.send(error.message);
            console.log(error);
        }
    }   
});

// GET edit subcategory
router.get("/edit/:id", async (req,res)=>{
    try {
        const id = req.params.id;
        const cats = await Category.find();
        const subcats = await Subcategory.findById(id);
        res.status(201).render("admin/edit_subcategory", {
            title: 'Edit Category',
            cats,
            subcats
        });
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('danger',`Sub Category not found!`);
            res.redirect('/admin/subcategory');
        } else {
            console.log(error);
            res.send(error)
        }
    }
});

// POST edit subcategory
router.post('/edit/:id', upload.single('image'), [
    check('name','Sub category name must have a value').notEmpty(),
    check('category','Please select Category name').notEmpty(),
],async (req,res) => {
    try {
        const {name, category} = req.body;
        const validationErrors = validationResult(req)
        if (validationErrors.errors.length > 0) {
            const alert = validationErrors.array()
            const cats = await Category.find();
            return res.render('admin/edit_subcategory', {
                title: 'Edit Sub Category',
                alert,
                cats
            })
        }
        const id = req.params.id;
        // const myArray = category.split("-");
        const subcat = await Subcategory.findById(id);
        subcat.name = name;
        subcat.category = category;
        // subcat.categoryName = myArray[1];
        if (typeof req.file !== 'undefined') {
            oldImage = "public" + subcat.image;
            fs.remove(oldImage, function (err) {
                if (err) { console.log(err); }
            })
            const image = req.file.path.replace(/\\/g,"/").replace('public','');
            subcat.image = image;
        }
        await subcat.save();
        req.flash('success',`Sub Category Edited successfully`);
        res.redirect('/admin/subcategory')
    } catch (error) {
        console.log(error.message);
        if (error.code == 11000) {
            req.flash('danger',`Sub Category name '${req.body.name}' already exist!`);
            // res.redirect('/admin/subcategory');
            res.redirect(`/admin/subcategory/edit/${req.params.id}`);
        } else if (error.name === 'CastError') {
            req.flash('danger',`Sub Category not found!`);
            res.redirect('/admin/subcategory');
        } else {
            res.send(error.message);
            console.log(error);
        }
    }   
});

// GET delete subcategory
router.get("/delete/:id", async (req,res)=>{
    try {
        const id = req.params.id;
        const cat = await Subcategory.findByIdAndRemove(id);
        image = "public" + cat.image;
        fs.remove(image, function (err) {
            if (err) { console.log(err); }
        })
        req.flash('success',`Subcategory Deleted successfully`);
        res.redirect('/admin/subcategory')
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('danger',`Sub Category not found!`);
            res.redirect('/admin/subcategory');
        } else {
            console.log(error);
            res.send(error)
        }
    }
});

//exports
module.exports = router;