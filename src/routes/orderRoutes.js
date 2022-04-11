const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay')

const razorpay = new Razorpay({
    key_id: process.env.RAZOR_PAY_KEY_ID,
    key_secret: process.env.RAZOR_PAY_KEY_SECRET,
})

const checkUser = require('../middleware/authMiddleware');
const checkStore = require('../middleware/selectedStore');

const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Unit = require('../models/unitModel');

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
        if (size < 7 || Object.values(user.address).includes(undefined)) {
            req.flash('danger', 'Address is required!');
            return res.redirect('/checkout');
        }
        const address = `${user.address.house},${user.address.apartment},${user.address.landmark},${user.address.city},${user.address.state},${user.address.country}-${user.address.postal}`;
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
        var payableamount = cart.total + parseFloat(req.deliverycharge) - cart.discount;
        // check promo
        const order = new Order({
            vendor: req.store,
            user: user.id,
            useraddress: address,
            deliverycharge: req.deliverycharge,
            totalamount: cart.total,
            discountamount: cart.discount,
            payableamount,
            products,
            paymentmode: req.body.pay
        })
        await order.save();
        console.log('Order created');
        // manage promo
        // empty cart
        res.redirect(`/order/detail/${order.id}`);
        // res.redirect('/');
    } catch (error) {
        console.log(error);
        res.redirect('/404');
    }
})

// GET order razor
router.post('/razor', checkUser, checkStore, async (req, res) => {
    const user = req.user;
    const size = Object.keys(user.address).length;
    if (size < 7 || Object.values(user.address).includes(undefined)) {
        return res.send({status: 'fail', msg: 'Address is required!'});
    }
    const cart = await Cart.findOne({ userId: req.user.id, vendorId: req.store });
    const discount = cart.discount ? cart.discount : 0;
    const total = cart.total + parseFloat(req.deliverycharge) - discount;
    let options = {
        amount: total * 100,
        currency: "INR",
    };
    razorpay.orders.create(options, function (err, order) {
        res.json(order)
    })
})

router.post('/is-order-complete', (req, res) => {
    razorpay.payments.fetch(req.body.razorpay_payment_id).then((paymentDocument) => {
        // console.log(paymentDocument);
        if (paymentDocument.status == 'captured') {
            // create order
            // console.log('wow');
            res.redirect('/')
        } else {
            res.redirect('/account')
        }
    })
})

// GET cancel order
router.get('/cancel/:id', checkUser, async (req, res) => {
    try {
        const id = req.params.id;
        await Order.findByIdAndUpdate(id, { status: 'Cancelled' });
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
        const order = await Order.findOne({ id: id, user: req.user.id });
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