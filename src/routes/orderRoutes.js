const express = require('express');
const router = express.Router();

const checkUser = require('../middleware/authMiddleware');
const checkStore = require('../middleware/selectedStore');

const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Unit = require('../models/unitModel');
const Promo = require('../models/promoModel');

const Razorpay = require('razorpay')
const razorpay = new Razorpay({
    key_id: process.env.RAZOR_PAY_KEY_ID,
    key_secret: process.env.RAZOR_PAY_KEY_SECRET,
})

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_KEY_SECRET);

// place order
router.post('/', checkUser, checkStore, async (req, res) => {
    try {
        if (req.user) {
            var cart = await Cart.findOne({ userId: req.user.id, vendorId: req.store });
            // var cartLength = cart.products.length;
        } else {
            req.flash('danger', 'Please login first!');
            return res.redirect('/signup');
        }
        // create order
        const user = req.user;
        const size = Object.keys(user.address).length;
        if (size < 4 || Object.values(user.address).includes(undefined)) {
            req.flash('danger', 'Address is required!');
            return res.redirect('/checkout');
        }
        const address = `${user.address.house},${user.address.landmark}-${user.address.postal}`;
        if (cart.products.length == 0) {
            req.flash('success', "Cart is empty can not checkout.")
            return res.redirect('/cart');
        }
        var products = [];
        for (let i = 0; i < cart.products.length; i++) {
            const product = await Product.findById(cart.products[i].productId);
            var pro = {
                productId: product.id,
                quantity: cart.products[i].quantity,
                name: product.productname,
                weight: product.productweight,
                price: product.totalprice,
            }
            // reduce stock
            product.qtyweight = product.qtyweight - cart.products[i].quantity;
            product.save();
            products.push(pro);
        }
        const discount = cart.discount ? cart.discount : 0;
        const payableamount = (cart.total + parseFloat(req.deliverycharge) - discount).toFixed(2);
        // check promo
        const order = new Order({
            vendor: req.store,
            user: user.id,
            useraddress: address,
            deliverycharge: req.deliverycharge,
            totalamount: cart.total,
            discountamount: discount,
            payableamount,
            products,
            paymentmode: req.body.pay
        })
        await order.save();
        // manage promo
        if (cart.promo) { await Promo.findByIdAndUpdate(cart.promo, { '$inc': { 'times': -1 } }); }
        // empty cart
        // cart.products = [];
        // cart.total = 0;
        // cart.discount = 0;
        // cart.save();
        res.redirect(`/order/detail/${order.id}`);
        // res.redirect('/');
    } catch (error) {
        console.log(error);
        res.redirect('/404');
    }
})

// razor
// GET order razor
router.post('/razor', checkUser, checkStore, async (req, res) => {
    const user = req.user;
    const size = Object.keys(user.address).length;
    if (size < 4 || Object.values(user.address).includes(undefined)) {
        return res.send({ status: 'fail', msg: 'Address is required!' });
    }
    const cart = await Cart.findOne({ userId: req.user.id, vendorId: req.store });
    if (cart.products.length == 0) {
        req.flash('success', "Cart is empty can not checkout.")
        return res.json({status: 'fail'});
    }
    const discount = cart.discount ? cart.discount : 0;
    const total = (cart.total + parseFloat(req.deliverycharge) - discount).toFixed(2);
    let options = {
        amount: total * 100,
        currency: "INR",
    };
    razorpay.orders.create(options, function (err, order) {
        res.json(order)
    })
})

// POST is complete
router.post('/is-order-complete', checkUser, checkStore, async (req, res) => {
    let body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
    var crypto = require("crypto");
    var expectedSignature = crypto.createHmac('sha256', process.env.RAZOR_PAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
    if (expectedSignature === req.body.razorpay_signature) {
        razorpay.payments.fetch(req.body.razorpay_payment_id).then(async (paymentDocument) => {
            // console.log(paymentDocument);
            if (paymentDocument.status == 'captured') {
                try {
                    if (req.user) {
                        var cart = await Cart.findOne({ userId: req.user.id, vendorId: req.store });
                    } else {
                        req.flash('danger', 'Please login first!');
                        return res.redirect('/signup');
                    }
                    // create order
                    const user = req.user;
                    const size = Object.keys(user.address).length;
                    if (size < 4 || Object.values(user.address).includes(undefined)) {
                        req.flash('danger', 'Address is required!');
                        return res.redirect('/checkout');
                    }
                    const address = `${user.address.house},${user.address.landmark}-${user.address.postal}`;
                    if (cart.products.length == 0) {
                        req.flash('success', "Cart is empty can not checkout.")
                        return res.redirect('/cart');
                    }
                    var products = [];
                    for (let i = 0; i < cart.products.length; i++) {
                        const product = await Product.findById(cart.products[i].productId);
                        var pro = {
                            productId: product.id,
                            quantity: cart.products[i].quantity,
                            name: product.productname,
                            weight: product.productweight,
                            price: product.totalprice,
                        }
                        // reduce stock
                        product.qtyweight = product.qtyweight - cart.products[i].quantity;
                        product.save();
                        products.push(pro);
                    }
                    const discount = cart.discount ? cart.discount : 0;
                    const payableamount = (cart.total + parseFloat(req.deliverycharge) - discount).toFixed(2);
                    // check promo
                    const order = new Order({
                        vendor: req.store,
                        user: user.id,
                        useraddress: address,
                        deliverycharge: req.deliverycharge,
                        totalamount: cart.total,
                        discountamount: discount,
                        payableamount,
                        products,
                        paymentmode: 'razor',
                        paymentId: paymentDocument.id
                    })
                    await order.save();
                    // manage promo
                    if (cart.promo) { await Promo.findByIdAndUpdate(cart.promo, { '$inc': { 'times': -1 } }); }
                    // empty cart
                    // cart.products = [];
                    // cart.total = 0;
                    // cart.discount = 0;
                    // cart.save();
                    res.redirect(`/order/detail/${order.id}`);
                } catch (error) {
                    console.log(error);
                    res.redirect('/404');
                }
            } else {
                res.redirect('/account')
            }
        })
    } else {
        console.log(paymentDocument.status);
        res.status(400).send('Bad request');
    }
})

// stripe
// GET order stripe
router.post('/stripe', checkUser, checkStore, async (req, res) => {
    try {
        const user = req.user;
        const size = Object.keys(user.address).length;
        if (size < 4 || Object.values(user.address).includes(undefined)) {
            return res.send({ status: 'fail', msg: 'Address is required!' });
        }
        const cart = await Cart.findOne({ userId: req.user.id, vendorId: req.store });
        if (cart.products.length == 0) {
            req.flash('success', "Cart is empty can not checkout.")
            return res.json({status: 'fail'});
        }
        const discount = cart.discount ? cart.discount : 0;
        const total = (cart.total + parseFloat(req.deliverycharge) - discount).toFixed(2);
        const paymentIntent = await stripe.paymentIntents.create({
            amount: total * 100,
            currency: 'inr',
            payment_method: 'pm_card_visa',
            payment_method_types: ['card'],
        });
        // console.log(paymentIntent);
        res.json({ client_secret: paymentIntent.client_secret })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message })
    }
})

// place order after stripe
router.post('/stripe/create', checkUser, checkStore, async (req, res) => {
    try {
        if (req.user) {
            var cart = await Cart.findOne({ userId: req.user.id, vendorId: req.store });
            // var cartLength = cart.products.length;
        } else {
            req.flash('danger', 'Please login first!');
            return res.redirect('/signup');
        }
        const paymentIntent = await stripe.paymentIntents.retrieve(req.body.intentId);
        if (paymentIntent.status != 'succeeded') {
            return res.send({ error: `Payment status: '${paymentIntent.status}'` })
        }
        // create order
        const user = req.user;
        const size = Object.keys(user.address).length;
        if (size < 3 || Object.values(user.address).includes(undefined)) {
            req.flash('danger', 'Address is required!');
            return res.redirect('/checkout');
        }
        const address = `${user.address.house},${user.address.landmark}-${user.address.postal}`;
        if (cart.products.length == 0) {
            req.flash('success', "Cart is empty can not checkout.")
            return res.redirect('/cart');
        }
        var products = [];
        for (let i = 0; i < cart.products.length; i++) {
            const product = await Product.findById(cart.products[i].productId);
            var pro = {
                productId: product.id,
                quantity: cart.products[i].quantity,
                name: product.productname,
                weight: product.productweight,
                price: product.totalprice,
            }
            // reduce stock
            product.qtyweight = product.qtyweight - cart.products[i].quantity;
            product.save();
            products.push(pro);
        }
        const discount = cart.discount ? cart.discount : 0;
        const payableamount = (cart.total + parseFloat(req.deliverycharge) - discount).toFixed(2);
        // check promo
        const order = new Order({
            vendor: req.store,
            user: user.id,
            useraddress: address,
            deliverycharge: req.deliverycharge,
            totalamount: cart.total,
            discountamount: discount,
            payableamount,
            products,
            paymentmode: 'stripe',
            paymentId: paymentIntent.id
        })
        await order.save();
        // manage promo
        if (cart.promo) { await Promo.findByIdAndUpdate(cart.promo, { '$inc': { 'times': -1 } }); }
        // empty cart
        // cart.products = [];
        // cart.total = 0;
        // cart.discount = 0;
        // cart.save();
        res.send({ url: `/order/detail/${order.id}` })
    } catch (error) {
        console.log(error);
        res.send({ url: `/404` })
    }
})

// webhooks
// router.post('/webhook', async (req, res) => {
//     let data, eventType;
//     // Check if webhook signing is configured.
//     if (process.env.STRIPE_WEBHOOK_SECRET) {
//         // Retrieve the event by verifying the signature using the raw body and secret.
//         let event;
//         let signature = req.headers['stripe-signature'];
//         try {
//             event = stripe.webhooks.constructEvent(
//                 req.rawBody,
//                 signature,
//                 process.env.STRIPE_WEBHOOK_SECRET
//             );
//         } catch (err) {
//             console.log(`⚠️  Webhook signature verification failed.`);
//             console.log(err.message);
//             return res.sendStatus(400);
//         }
//         data = event.data;
//         eventType = event.type;
//     } else {
//         // Webhook signing is recommended, but if the secret is not configured in `config.js`,
//         // we can retrieve the event data directly from the request body.
//         data = req.body.data;
//         eventType = req.body.type;
//     }

//     if (eventType === 'payment_intent.created') {
//         console.log('💰 Payment created!');
//     }
//     if (eventType === 'payment_intent.succeeded') {
//         // Funds have been captured
//         // Fulfill any orders, e-mail receipts, etc
//         // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
//         console.log('💰 Payment captured!');
//     } else if (eventType === 'payment_intent.payment_failed') {
//         console.log('❌ Payment failed.');
//     }
//     res.sendStatus(200);
// });

// GET cancel order
router.get('/cancel/:id', checkUser, async (req, res) => {
    try {
        const id = req.params.id;
        await Order.findByIdAndUpdate(id, { status: 'Cancelled', canceldate: Date.now() });
        res.redirect('/account');
    } catch (error) {
        console.log(error.message);
        if (error.name === 'CastError' || error.name === 'TypeError') {
            req.flash('danger', `Order not found!`);
            res.redirect('/account');
            // res.redirect('/404');
        } else {
            res.send(error)
        }
    }
})

// GET order detail
router.get('/detail/:id', checkUser, checkStore, async (req, res) => {
    try {
        if (req.user) {
            var cart = await Cart.findOne({ userId: req.user.id });
            var cartLength = cart.products.length;
        } else {
            var cartLength = req.session.cart.products.length;
        }
        const id = req.params.id;
        const order = await Order.findOne({ _id: id, user: req.user.id });
        let updated = [];
        for (let i = 0; i < order.products.length; i++) {
            let product = await Product.findById(order.products[i].productId);
            let unit = null;
            if (product) {
                unit = await Unit.findById(product.unit);
            }
            let e = {
                image: product ? product.image : "",
                name: order.products[i].name,
                quantity: order.products[i].quantity,
                weight: order.products[i].weight,
                price: order.products[i].price,
                unit: unit ? unit.name : ""
            }
            updated.push(e)
        }
        res.render('order_detail', {
            title: 'Order detail',
            order,
            updated,
            cartLength,
            storename: req.storename,
            user: req.user
        });
    } catch (error) {
        console.log(error.message);
        res.redirect('/404');
    }
});

module.exports = router;