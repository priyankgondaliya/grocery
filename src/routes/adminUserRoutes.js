const express = require('express');
const router = express.Router();
const formatDate = require('../helpers/formateDate');

const User = require('../models/userModel');
const Order = require('../models/orderModel');

const checkAdmin = require('../middleware/authAdminMiddleware');

// get all users
router.get("/", checkAdmin, async (req, res) => {
    try {
        const users = await User.find({ isAdmin: { $ne: true } }); // exclude admin
        res.render("admin/users", {
            title: "User List",
            users
        })
    } catch (error) {
        res.status(400).send(error.message);
        console.log(error);
    }
});

// get user transaction
router.get("/transaction", checkAdmin, async (req, res) => {
    try {
        const orders = await Order.find({ paymentmode: {$in: ['razor', 'stripe']} });
        let updated = [];
        for (let i = 0; i < orders.length; i++) {
            const user = await User.findById(orders[i].user);
            let e = {
                name: user.firstname + ' ' + user.lastname,
                transactionId: orders[i].paymentId,
                amount: orders[i].payableamount,
                paymentmode: orders[i].paymentmode,
                date: formatDate(new Date(orders[i].orderdate))
            }
            updated.push(e)
        }
        res.render("admin/user_transaction", {
            title: "User Transaction",
            updated
        })
    } catch (error) {
        res.status(400).send(error.message);
        console.log(error);
    }
});

module.exports = router;