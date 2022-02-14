const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
    async function(req, res) {
        const user = req.myUser;
        const token = await user.generateAuthToken();
        res.cookie("jwt", token, {
            expires:new Date( Date.now() + 90*24*60*60*1000 ),
            httpOnly:true,
            // secure:true
        });
        const redirect = req.session.redirectToUrl;
        req.session.redirectToUrl = undefined;
        res.redirect(redirect || '/account');
        // res.redirect('/account'); //old
    }
);

module.exports = router;