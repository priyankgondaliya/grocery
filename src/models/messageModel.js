const mongoose = require('mongoose');
const validator = require("validator");

const messageSchema = new mongoose.Schema ({
    name : {
        type:String,
        required:true
    },
    email : {
        type:String,
        required:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("email is invalid")
            }
        }
    },
    address : {
        type:String,
        required:true
    },
    phone : {
        type:Number,
        // type:String,
        require:true
    },
    message : {
        type:String,
        required:true
    }
})

module.exports= new mongoose.model("Message", messageSchema);