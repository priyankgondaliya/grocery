const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/UserModel');
const bcrypt = require("bcryptjs");
const createError = require('http-errors');
const { sendForgotPassMail } = require('../helpers/sendmail')

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
router.post("/login",async(req, res, next)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userEmail = await User.findOne({email:email});
        if (!userEmail) {
            return next(createError.BadRequest('Invalid email'))
        }
        const isMatch = await bcrypt.compare(password, userEmail.password);
        if (!isMatch) {
            return next(createError.BadRequest('Invalid passsword'))
        }
        const token = await userEmail.generateAuthToken();
        console.log("the token part" + token);
        res.cookie("jwt",token,{
        expires:new Date(Date.now()+ 600000),
        httpOnly:true,
        // secure:true
        });
        res.status(201).render("index");
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
router.get("/logoutall", auth, async (req,res) => {
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

// Forgot Pass
router.get("/forgot_pass", async (req, res, next) => {
    res.render("forgot_pass",{
        title:  "Forgot password"
    });
})
router.post("/forgot_pass", async (req, res, next) => {
    // generate pass
    let pass = (Math.random() + 1).toString(36).substring(5);
    console.log("random: ", pass);

    // set pass
    const email = req.body.email
    console.log("email: " + email);
    const user = await User.findOne({email})
    if (!user) {
        return next(createError.BadRequest('Please enter your registered emailId.'))
    }
    user.password = pass;
    await user.save();

    // send mail
    sendForgotPassMail(email, pass)
    console.log('pass :'+ pass);
    res.status(200).send({
        status: "success",
        message: "check your mail"
    })
})

module.exports = router;