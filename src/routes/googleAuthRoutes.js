const express = require('express');
const router = express.Router();
const passport = require('passport');

const Cart = require('../models/cartModel');

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

        // CART: session to db
        const dbCart = await Cart.findOne({ userId: user.id});
        const sessionProducts = req.session.cart.products;
        if ( sessionProducts.length != 0 ) {
            for (let i = 0; i < sessionProducts.length; i++) {
                let itemIndex = dbCart.products.findIndex(p => p.productId == sessionProducts[i].productId);

                if (itemIndex > -1) {
                    //product exists in the dbCart, update the quantity
                    let productItem = dbCart.products[itemIndex];
                    // productItem.quantity = sessionProducts[i].quantity;
                    productItem.quantity = productItem.quantity + sessionProducts[i].quantity;
                    dbCart.products[itemIndex] = productItem;
                } else {
                    //product does not exists in dbCart, add new item
                    dbCart.products.push({
                        productId: sessionProducts[i].productId,
                        quantity: sessionProducts[i].quantity,
                        price: sessionProducts[i].totalprice
                    });
                }
            }
            req.session.cart = undefined;
            await dbCart.save();
        }

        const redirect = req.session.redirectToUrl;
        req.session.redirectToUrl = undefined;
        res.redirect(redirect || '/account');
    }
);

module.exports = router;