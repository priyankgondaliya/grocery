const mongoose = require('mongoose');
const validator = require("validator");

const newsletterSchema = new mongoose.Schema ({
    email: {
        type:String,
        required:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("email is invalid")
            }
        }
    }
})

const Newsletter = new mongoose.model("Newsletter", newsletterSchema);
module.exports = Newsletter;