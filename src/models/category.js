const mongoose = require('mongoose');

//Category schema
const CategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    tax: {
        type: Number,
    },
    image: {
        type: String,
    },
    featured: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    }
});

// CategorySchema.pre('save', function (next) {
//     var t1 = Date.now();
//     mongoose.model('Category').count({}, (err, c) => {
//         console.log('count', c);
//         next();
//         var t2 = Date.now();
//         console.log(t2-t1);
//     })
// });

module.exports = mongoose.model('Category', CategorySchema);