const express = require('express');
const router = express.Router();
const User = require('../models/userModel');

// get all users
router.get("/", async (req,res)=>{
    try {
        const users = await User.find();
        res.render("admin/users", {
            title: "User List",
            users
        })
    } catch (error) {
        res.status(400).send(error.message);
        console.log(error);
    }
});

// Block User

module.exports = router;