const express = require('express');
const router = express.Router();

const checkUser = require('../middleware/authMiddleware');
const checkStore = require('../middleware/selectedStore');

const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Get cart
router.get("/", checkUser, checkStore, async (req,res)=>{
    if (req.user) {
        var cart = await Cart.findOne({ userId: req.user.id, vendorId: req.store});
        var myCart = [];
        for (let i = 0; i < cart.products.length; i++) {
            var prod = await Product.findById(cart.products[i].productId);
            if (prod == null) {
                cart.products.splice(i,1);
            } else {
                prod.quantity = cart.products[i].quantity;
                myCart.push(prod);
            }
        }
        cart.save();
        var cartLength = cart.products.length;
    } else {
        var myCart = [];
        var cartLength = 0;
        const storeId = req.store;
        if (typeof req.session.cart == undefined) {
            req.session.cart = {};
            req.session.cart[storeId] = [];
        } else {
            if (req.session.cart[storeId] == undefined) {
                req.session.cart[storeId] = [];
            } else {
                var cart = req.session.cart[storeId]; // add prods
                // console.log(cart);
                var myCart = [];
                for (let i = 0; i < cart.length; i++) {
                    var prod = await Product.findById(cart[i].productId);
                    if (prod == null) {
                        cart.splice(i,1);
                    } else {
                        prod.quantity = cart[i].quantity;
                        myCart.push(prod);
                    }
                }
                var cartLength = cart.length;
            }
        }
    }
    res.render("cart", {
        title: 'Cart',
        user: req.user,
        myCart,
        cartLength,
        storename: req.storename,
    });
});

// add to cart
router.get("/add/:product", checkUser, checkStore, async (req, res)=>{
    try {
        const product = await Product.findById(req.params.product);
        if (product.vendor != req.store) {
            const redirect = req.session.redirectToUrl;
            req.session.redirectToUrl = undefined;
            return res.redirect(redirect || '/cart');
        }
        // check if user is logged
        if (req.user) {
            // change in mongo
            var cart = await Cart.findOne({ userId: req.user.id, vendorId: req.store});
            if (cart) {
                //cart exists for user
                let itemIndex = cart.products.findIndex(p => p.productId == product.id);
    
                if (itemIndex > -1) {
                    //product exists in the cart, update the quantity
                    let productItem = cart.products[itemIndex];
                    productItem.quantity = productItem.quantity + 1;
                    cart.products[itemIndex] = productItem;
                } else {
                    //product does not exists in cart, add new item
                    cart.products.push({
                        productId: product._id,
                        quantity: 1,
                        // price: product.totalprice
                    });
                }
                await cart.save();
            } else {
                const cart = new Cart({
                    userId: req.user.id,
                    vendorId: req.store,
                    products: [{
                        productId: product._id,
                        quantity: 1,
                        // price: product.totalprice
                    }]
                })
                await cart.save();
            }
            const redirect = req.session.redirectToUrl;
            req.session.redirectToUrl = undefined;
            res.redirect(redirect || '/cart');
        } else {
            // store in session
            var storeId = req.store;
            if (typeof req.session.cart == "undefined") {
                req.session.cart = {};
                req.session.cart[storeId] = [];
                req.session.cart.storeId.push({
                    productId: product.id,
                    quantity: 1,
                });
            } else {
                var cart = req.session.cart;
                if (req.session.cart[storeId] == undefined) {
                    cart[storeId] = [];
                    var old = cart[storeId];
                    old.push({
                        productId: product.id,
                        quantity: 1,
                    });
                    cart[storeId] = old;
                    req.session.cart = cart;
                } else {
                    const cart = req.session.cart[storeId];
                    var newItem = true;
                    for (var i=0; i < cart.length; i++) {
                        if ( cart[i].productId == product.id) {
                            cart[i].quantity++;
                            newItem = false;
                            break;
                        }
                    }
                    if (newItem) {
                        var old = cart;
                        old.push({
                            productId: product.id,
                            quantity: 1,
                        });
                    }
                }
            }
            const redirect = req.session.redirectToUrl;
            req.session.redirectToUrl = undefined;
            res.redirect(redirect || '/cart');
        }
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError') {
            console.log(error);
            res.redirect('/404');
        } else {
            console.log(error);
            res.send(error)
        }        
    }
})

//GET update product
router.get('/update/:product', checkUser, checkStore, async (req,res) => {
    // console.log(req.url);
    try {
        if (req.user) {
            var cart = await Cart.findOne({ userId: req.user.id, vendorId: req.store});
            var id = req.params.product;
            var action = req.query.action;
        
            for (var i=0; i<cart.products.length; i++) {
                if (cart.products[i].productId == id) {
                    switch (action) {
                        case "add":
                            cart.products[i].quantity++;
                            break;
                        case "remove":
                            cart.products[i].quantity--;
                            if (cart.products[i].quantity<1) {
                                cart.products.splice(i,1);
                            }
                            break;
                        case "clear":
                            cart.products.splice(i,1);
                            break;
                        default:
                            console.log('Update problem');
                            break;
                    }
                    break;
                }
            }
            await cart.save();
        } else {
            var storeId = req.store;
            var cart = req.session.cart[storeId];
            var id = req.params.product;
            var action = req.query.action;
        
            for (var i=0; i<cart.length; i++) {
                if (cart[i].productId == id) {
                    switch (action) {
                        case "add":
                            cart[i].quantity++;
                            break;
                        case "remove":
                            cart[i].quantity--;
                            if (cart[i].quantity<1) {
                                cart.splice(i,1);
                            }
                            break;
                        case "clear":
                            cart.splice(i,1);
                            break;
                        default:
                            console.log('Update problem');
                            break;
                    }
                    break;
                }
            }
        }
        res.redirect('/cart');
    } catch (error) {
        console.log(error);
        res.send(error)
    }
});

// GET clear cart
router.get('/clear', checkUser, checkStore, async (req,res) => {
    if (req.user) {
        var cart = await Cart.findOne({ userId: req.user.id, vendorId: req.store});
        cart.products = [];
        await cart.save();
    } else {
        var storeId = req.store;
        delete req.session.cart[storeId];
    }
    req.flash('success','Cart cleared!');
    res.redirect('/cart');
});

module.exports = router;