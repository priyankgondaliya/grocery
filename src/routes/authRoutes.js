const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/userModel');
const bcrypt = require("bcryptjs");
const checkUser = require('../middleware/authMiddleware');
const { sendForgotPassMail } = require('../helpers/sendmail')
const { check, validationResult } = require('express-validator');

// POST register
router.post("/register", [
    check('firstname','Please enter firstname.').notEmpty(),
    check('lastname','Please enter lastname.').notEmpty(),
    check('email','Please enter valid email.').isEmail(),
    check('password','Password should be atleast 6 characters long.').isLength({ min: 6 }),
    // check('number','Plaese enter mobile number').notEmpty(),
  ],async(req,res)=>{
    try {
        const validationErrors = validationResult(req)
        // console.log(validationErrors.errors);
        if (validationErrors.errors.length > 0) {
            const alert = validationErrors.array()
            console.log(alert);
            return res.render('account', {
                title: 'Account',
                alert
            })
        }
        const userExist = await User.findOne({email: req.body.email})
        if (userExist && userExist.googleid) {
            // console.log(userExist.googleid);
            userExist.password = req.body.password;
            await userExist.save();
            return res.render('account', {
                title: 'Account',
                alert: [{msg:'Registered.'}]
            })
        }
        if (userExist) {
            return res.render('account', {
                title: 'account',
                alert: [{msg:'Email is already registerd, Try logging in.'}]
            })
        }
        const user = new User({
            firstname : req.body.firstname,
            lastname : req.body.lastname,
            email : req.body.email,
            password : req.body.password,
            // phone : req.body.phone
        })
        const token = await user.generateAuthToken();
        res.cookie("jwt", token, {
            expires:new Date(Date.now()+ 600000),
            httpOnly:true
        });
        await user.save();
        res.status(201).render("account", {
            title: 'My account',
            alert: [{msg:'Registered successfully, Now you can login.'}]
        });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
})

// POST login
router.post("/login", [
    check('email','Please enter valid email.').isEmail(),
    check('password','Please enter password!').notEmpty(),
  ],async(req, res)=>{
    try {
        const validationErrors = validationResult(req)
        if (validationErrors.errors.length > 0) {
            const alert = validationErrors.array()
            return res.render('account', {
                title: 'account',
                alert
            })
        }
        const { email, password } = req.body;
        const userExist = await User.findOne({email});
        if (!userExist) {
            return res.status(201).render("account", {
                title: 'My account',
                alert: [{msg:'Invalid email or password!'}]
            });
        }
        if (!userExist.password) {
            return res.status(201).render("account", {
                title: 'My account',
                alert: [{msg:'Please login with google.'}]
            });
        }
        const isMatch = await bcrypt.compare(password, userExist.password);
        if (!isMatch) {
            return res.status(201).render("account", {
                title: 'My account',
                alert: [{msg:'Invalid email or password!'}]
            });
        }
        const token = await userExist.generateAuthToken();
        // console.log("the token part" + token);
        res.cookie("jwt", token, {
            expires:new Date( Date.now() + 90*24*60*60*1000 ),
            httpOnly:true,
            // secure:true
        });
        res.redirect('/account');
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
})

// GET logout
router.get("/logout", auth, async(req,res) => {
    try {
        // for single device logout
        req.user.tokens = req.user.tokens.filter((currElement)=>{
            return currElement.token !== req.token
        })
        // logout from all device
        // req.user.tokens = [];
        res.clearCookie("jwt");
        await req.user.save();
        res.redirect('/signup');
        // res.status(201).render("account", {
        //     title: 'My account',
        // });
    } catch (error) {
        res.status(500).send(error.message);
    }
})

// GET logoutAll
router.get("/logoutall", auth, async (req,res) => {
    try {
        // console.log(req.user);

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

// Change Pass
router.post("/changepass",[
    check('currentpass','Please enter current password!').notEmpty(),
    check('newpass','Please enter new password!').notEmpty(),
    check('cfnewpass','Please enter confirm new password!').notEmpty(),
  ], checkUser, async (req, res, next) => {
    const validationErrors = validationResult(req)
    if (validationErrors.errors.length > 0) {
        const alert = validationErrors.array()
        return res.render('my_account', {
            title: 'My account',
            user: req.user,
            alert
        })
    }
    const {currentpass, newpass, cfnewpass} = req.body;
    const user = req.user;
    const isMatch = await bcrypt.compare(currentpass, user.password);
    if (!isMatch) {
        return res.status(201).render("my_account", {
            title: "My account",
            user: req.user,
            alert: [{msg:'Password you entered is wrong.'}]
        });
    }
    if (currentpass == newpass ) {
        return res.status(201).render("my_account", {
            title: "My account",
            user: req.user,
            alert: [{msg:'New password can not be same as current password.'}]
        });
    }
    if (cfnewpass !== newpass) {
        return res.status(201).render("my_account", {
            title: "My account",
            user: req.user,
            alert: [{msg:'Password and confirm password does not match!'}]
        });
    }
    // await User.findOneAndUpdate({email: user.email}, {password: newpass})
    user.password = newpass;
    await user.save();
    return res.status(201).render("my_account", {
        title: "My account",
        user: req.user,
        alert: [{msg:'Password changed.'}]
    });
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

    // set pass
    const email = req.body.email
    const user = await User.findOne({email})
    if (!user) {
        return res.render("forgot_pass",{
            title:  "Forgot password",
            alert: [{msg:'Please enter registered email id.'}]
        });
    }
    user.password = pass;
    await user.save();

    // send mail
    sendForgotPassMail(email, pass)
    console.log('pass : '+ pass);
    res.status(201).render("account", {
        title: 'My account',
        alert: [{msg:'A new password sent to your mail. Check your mail and Try logging in.'}],
    });
})

// post address
router.post("/address", [
    check('house','Please enter House number!').notEmpty(),
    check('apartment','Please enter Apartment!').notEmpty(),
    check('landmark','Please enter Landmark!').notEmpty(),
    check('city','Please enter City!').notEmpty(),
    check('state','Please enter State!').notEmpty(),
    check('country','Please enter Country!').notEmpty(),
    check('postal','Please enter Postal code!').isNumeric()
  ], checkUser, async (req, res, next) => {
    try {
        const user = req.user;
        const validationErrors = validationResult(req)
        if (validationErrors.errors.length > 0) {
            const alert = validationErrors.array()
            return res.render('my_account', {
                title: 'My account',
                alert,
                user
            })
        }
        user.address = {
            house: req.body.house,
            apartment: req.body.apartment,
            landmark: req.body.landmark,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            postal: req.body.postal
        }
        await user.save();
        return res.render('my_account', {
            title: 'My account',
            alert: [{msg:'Address added successfully.'}],
            user
        })
    } catch (error) {
        res.status(400).send(error);
        console.log(error);
    }
})

module.exports = router;