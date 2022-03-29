const express = require('express');
const router = express.Router();
const GeoPoint = require('geopoint');

const Vendor = require('../models/vendorModel');

// GET select store
router.get('/', (req, res) => {
    res.render("store",{
        title:  "Store Page",
        user: req.user,
        cartLength: 0,
        error: false
    });
});

// GET stores api
router.post('/nearstore', async (req, res) => {
    const lat = parseFloat(req.body.lat);
    const lng = parseFloat(req.body.lng);

    const vendors = await Vendor.find();
    let nearStores = [];
    for (let i = 0; i < vendors.length; i++) {
        let point1 = new GeoPoint(lat, lng);
        let point2 = new GeoPoint(vendors[i].coords.lat, vendors[i].coords.lng);
        let distance = point1.distanceTo(point2, true)
        if (distance < vendors[i].deliveryrange) {
            nearStores.push(vendors[i])
        }
    }
    // console.log(nearStores.length);
    if (nearStores.length == 0) {
        res.render("store",{
            title:  "Store Page",
            user: req.user,
            cartLength: 0,
            error: true
        });
    } else {
        res.render("selectstore",{
            title:  "Select Store",
            user: req.user,
            cartLength: 0,
            nearStores
        });
    }
});

router.get('/select/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const store = await Vendor.findById(id);
        if (store == null) {
            return res.redirect('/404');
        }
        res.cookie("selectStore", id, {
            expires: new Date( Date.now() + 90*24*60*60*1000 ),
            httpOnly: true,
            // secure:true
        });
        res.redirect('/');
    } catch (error) {
        console.log(error);
        res.send(error);
    }
})

module.exports = router;