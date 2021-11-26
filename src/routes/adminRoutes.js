const express = require('express');
const router = express.Router();

router.get("/", (req,res)=>{
    res.status(201).render("admin/admin_dashboard");
});

module.exports = router;