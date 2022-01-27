const mongoose = require('mongoose'); 

const productSchema = new mongoose.Schema ({
    category: {
        type: String,
        required:true
    },
    subcategory: {
        type: String,
    },
    company: {
        type: String,
    },
    productname: {
        type: String,
        required:true
    },
    type: {
        type: String,
        required:true
    },
    productweight: {
        type: String,
    },
    unit: {
        type: String,
    },
    costprice: {
        type: String,
        required:true
    },
    saleprice: {
        type: String,
        required:true
    },
    totalprice: {
        type: String,
    },
    image: {
        type: String
    },
    title: {
        type:String
    },
    description: {
        type:String
    }, 
})

module.exports = new mongoose.model("Product", productSchema);