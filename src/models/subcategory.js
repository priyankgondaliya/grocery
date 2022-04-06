const mongoose = require('mongoose');

//Category schema
const SubcategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
    },
    // categoryName: {
    //     type: String,
    // },
    image: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    }
});

module.exports = mongoose.model('Subcategory', SubcategorySchema);