const express = require('express');
const router = express.Router();
const GeoPoint = require('geopoint');

const Vendor = require('../models/vendorModel');

// GET select store
router.get('/', (req, res) => {
    res.render("store",{
        title:  "Store Page",
        user: req.user,
        cartLength: 0
    });
});

// GET stores api
router.get('/nearStore', async (req, res) => {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    const vendors = await Vendor.find();
    let nearStores = [];
    for (let i = 0; i < vendors.length; i++) {
        let point1 = new GeoPoint(lat, lng);
        let point2 = new GeoPoint(vendors[i].coords.lat, vendors[i].coords.lng);
        let distance = point1.distanceTo(point2, true)
        // console.log(distance +" "+ vendors[i].storename);
        // let distance = calcDistance(lat, lng, vendors[i].coords.lat, vendors[i].coords.lng)
        if (distance < vendors[i].deliveryrange) {
            nearStores.push(vendors[i])
        }
    }
    // console.log(nearStores);
    res.json(nearStores);
});

module.exports = router;