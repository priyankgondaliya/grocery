const express = require('express');
const router = express.Router();

const checkUser = require('../middleware/authMiddleware');

router.get("/signup", checkUser, (req,res)=>{
    if(req.user){
        return res.redirect('/dashboard');
    }
    res.status(201).render("account", {
        title: 'Signup | Signin',
    });
});

router.get("/account", checkUser, (req,res)=>{
    if(!req.user){
        return res.redirect('/signup');
    }
    res.render('my_account',{
        title: 'My account',
        user: req.user
    });
});

module.exports = router;