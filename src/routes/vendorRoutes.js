const express = require('express');
const router = express.Router();

router.get("/", (req,res)=>{
    res.status(201).render("vendor/vendor_dashboard", {
        title: 'Vendor Dashboard',
    });
});

// GET orders
router.get("/orders", (req,res)=>{
    res.status(201).render("vendor/orders",{
        title: 'Order List',
    });
});

module.exports = router;