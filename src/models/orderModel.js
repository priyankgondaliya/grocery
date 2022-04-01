const mongoose = require('mongoose'); 

const orderSchema = new mongoose.Schema ({
    vendor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Vendor',
    },
    // orderId: {
    //     type: String,
    //     required:true
    // },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        quantity: Number,
        name: String,
        weight: String,
        price: Number
    }],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    useraddress: {
        type: String,
        required: true
    },
    totalamount: {
        type: String,
        required: true
    },
    deliverycharge: {
        type: String,
        required: true
    },
    // payableamount: {
    //     type: String,
    //     required: true
    // },
    discountamount: {
        type: String,
    },
    orderdate: {
        type: Date,
        default: Date.now()
    },
    deliverydate: {
        type: Date,
    },
    paymentmode: {
        type: String,
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor"
    },
})

module.exports = new mongoose.model("Order", orderSchema);