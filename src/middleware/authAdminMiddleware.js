const jwt=require('jsonwebtoken');
const User = require('../models/userModel');

const checkAdmin = function (req, res, next) {
    // console.log("MIDDLEWARE");
    const token = req.cookies['jwt'];
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, function(err, decodedToken){
            if (err) {
                console.log("ERROR: "+err.message);
                req.user = null;
                return res.status(201).render("account", {
                    title: 'My account',
                    alert: [{msg:'Invalid token! Please login again.'}]
                });
            } else {
                User.findById(decodedToken._id, function (err, user) {
                    if (err) {
                        console.log("ERROR: "+err.message);
                        req.user = null;
                        return res.status(201).render("account", {
                            title: 'My account',
                            alert: [{msg:'Oops! An error occurred.'}]
                        });
                    }
                    if (!user) {
                        return res.status(201).render("account", {
                            title: 'My account',
                            alert: [{msg:'Please login as admin first.'}]
                        });
                    }
                    req.user = user;
                    next();
                });
            }
        });
    } else {
        req.user = null;
        next();
    }
}

module.exports = checkAdmin;