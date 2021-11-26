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
        require:true
    },
    message : {
        type:String,
        required:true
    }
})

// we need to create a collection of messages
const Message = new mongoose.model("Message", messageSchema);
module.exports= Message;