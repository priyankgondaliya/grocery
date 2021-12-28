const mongoose = require('mongoose'); 
const validator = require("validator");
const bcrypt = require('bcryptjs');

const vendorSchema = new mongoose.Schema ({
    storename: {
        type: String,
        required:true
    },
    ownername: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("email is invalid")
            }
        }
    },
    password: {
        type:String,
        required:true
    },
    contact: {
        type:Number,
        required:true
    },
    deliverycharge: {
        type:String
    },
    image: {
        type:String
    },
    address: {
       type:String,
       required:true
    }
})

// converting password into hash
vendorSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
    }
    next();
})

module.exports = new mongoose.model("Vendor",vendorSchema);