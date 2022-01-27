var mongoose = require('mongoose');

var promoSchema = mongoose.Schema({
    promo:{
        type: String,
        required: true,
    },
    times:{
        type: String,
    },
    date:{
        type: String,
    },
    type:{
        type: String,
    },
    minAmount:{
        type: String,
    },
    price:{
        type: String,
    },
    percentage:{
        type: String,
    },
    desc:{
        type: String,
    },
    dateCreated:{
        type: Date,
        default: Date.now,
        required:true
    }
});

module.exports = mongoose.model('Promo', promoSchema);