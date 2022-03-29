const Vendor = require('../models/vendorModel');

const checkStore = function (req, res, next) {
    const cookie = req.cookies['selectStore'];
    // console.log(cookie);
    if (cookie) {
        Vendor.findById(cookie, function (err, vendor) {
            if (err) {
                console.log("ERROR: "+err.message);
                // req.store = null;
                // req.flash('danger','An error occoured!');
                return res.redirect('/store');
            }
            if (!vendor) {
                // req.flash('danger','Please Login as Vendor first!');
                return res.redirect('/store');
            }
            req.store = cookie;
            next();
        });
    } else {
        return res.redirect('/store');
    }
}

module.exports = checkStore;