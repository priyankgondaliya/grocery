const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/UserModel');
const bcrypt = require("bcryptjs");

// GET register
router.get("/register",(req,res)=>{
    res.render('register');
})

// GET login
router.get("/login",(req,res)=>{
    res.render('login');
})

// POST register
router.post("/register",async(req,res)=>{
    try {
        const user = new User({
            firstname : req.body.firstname,
            firstname : req.body.firstname,
            email : req.body.email,
            password : req.body.password,
            phone : req.body.phone
        })
        console.log("the success part" + user);
        const token = await user.generateAuthToken();
        console.log("the token part"+token);
        res.cookie("jwt", token, {
            expires:new Date(Date.now()+ 600000),
            httpOnly:true
        });
        // console.log(cookie);
        await user.save();
        res.status(201).render("index");

    } catch (error) {
        res.status(400).send(error);
        console.log(error);
    }
})
    
// POST login
router.post("/login",async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userEmail = await User.findOne({email:email});
        const isMatch = await bcrypt.compare(password, userEmail.password);
        const token = await userEmail.generateAuthToken();
        console.log("the token part" + token);
        res.cookie("jwt",token,{
        expires:new Date(Date.now()+ 600000),
        httpOnly:true,
        // secure:true
    });
    if(isMatch){
        res.status(201).render("index");
    }else{
        res.send("invalid login details");
    }
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
})

// GET logout
router.get("/logout", auth, async(req,res) => {
    try {
        console.log(req.user);
        // for single device logout
        req.user.tokens = req.user.tokens.filter((currElement)=>{
            return currElement.token !== req.token
        })
        // logout from all device
        // req.user.tokens = [];
        res.clearCookie("jwt");
        console.log("logout successfully");
        await req.user.save();
        res.render("login");
    } catch (error) {
        res.status(500).send(error.message);
    }
})

// GET logoutAll
router.get("/logoutAll", auth, async (req,res) => {
    try {
        console.log(req.user);

        // logout from all device
        req.user.tokens = [];
        res.clearCookie("jwt");
        console.log("logout successfully");
        await req.user.save();
        res.render("login");
    } catch (error) {
        res.status(500).send(error);
    }
})

module.exports = router;