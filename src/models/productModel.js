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
    qtyweight: {
        type: String,
    },
    unit: {
        type: String,
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
    featured: {
        type: Boolean,
        default: false
    }
})

module.exports = new mongoose.model("Product", productSchema);