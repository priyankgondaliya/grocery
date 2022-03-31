const express = require('express');
const router = express.Router();
const passport = require('passport');
const checkStore = require('../middleware/selectedStore');

const Cart = require('../models/cartModel');

router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/callback', checkStore, passport.authenticate('google', { failureRedirect: '/failed' }),
    async function(req, res) {
        const user = req.myUser;
        const token = await user.generateAuthToken();
        res.cookie("jwt", token, {
            expires:new Date( Date.now() + 90*24*60*60*1000 ),
            httpOnly:true,
            // secure:true
        });

        // CART: session to db
        const cartSession = req.session.cart;
        for (const [key, value] of Object.entries(cartSession)) {
            // console.log(`${key} ${value}`);
            var cart = await Cart.findOne({ userId: user.id, vendorId: key});
            if ( value.length != 0 ) {
                for (let i = 0; i < value.length; i++) {
                    let itemIndex = cart.products.findIndex(p => p.productId == value[i].productId);
    
                    if (itemIndex > -1) {
                        //product exists in the cart, update the quantity
                        let productItem = cart.products[itemIndex];
                        // productItem.quantity = value[i].quantity;
                        productItem.quantity = productItem.quantity + value[i].quantity;
                        cart.products[itemIndex] = productItem;
                    } else {
                        //product does not exists in cart, add new item
                        cart.products.push({
                            productId: value[i].productId,
                            quantity: value[i].quantity,
                            // price: value[i].totalprice
                        });
                    }
                }
                // req.session.cart = undefined;
                cartSession[key] = [];
                console.log(cartSession);
                await cart.save();
            }
        }

        const redirect = req.session.redirectToUrl;
        req.session.redirectToUrl = undefined;
        res.redirect(redirect || '/account');
    }
);

module.exports = router;