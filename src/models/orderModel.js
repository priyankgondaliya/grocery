const mongoose = require('mongoose'); 

const orderSchema = new mongoose.Schema ({
    details: {
        type: String,
        required:true
    },
    vendor: {
        type: String,
        required:true
    },
    username: {
        type: String,
        required:true
    },
    useraddress: {
        type: String,
        required:true
    },
    totalamount: {
        type: String,
        required:true
    },
    deliverycharge: {
        type: String,
        required:true
    },
    payableamount: {
        type: String,
        required:true
    },
    discountamount: {
        type: String,
        required:true
    },
    cashback: {
        type: String,
        required:true
    },
    time: {
        type: String,
        required:true
    },
    paymentmode: {
        type: String,
        required:true
    },
    
})

module.exports = new mongoose.model("Order", orderSchema);