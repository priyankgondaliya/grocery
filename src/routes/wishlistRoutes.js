const express = require('express');
const router = express.Router();

router.get("/", (req,res)=>{
    res.status(201).render("wishlist", {
        title: 'Wishlist'
    });
});

module.exports = router;