const express = require('express');
const router = express.Router();
const Newsletter = require('../models/newsletterModel');
const formatDate = require('../helpers/formateDate');

// Get newsletter
router.get("/", async (req,res) => {
    try {
        const newsletters = await Newsletter.find(); //.limit(limit*1).skip((page-1)*limit);
        
        let updated = []
        for (let i = 0; i < newsletters.length; i++) {
            let e = {
                email: newsletters[i].email,
                date: formatDate(new Date(newsletters[i].date))
            }
            updated.push(e)
        }b
        res.render("admin/newsletter", {        
            title: "Newsletter",
            newsletters: updated
        })
    } catch (error) {
        res.status(400).send(error.message);
        console.log(error);
    }
})                  

module.exports = router;