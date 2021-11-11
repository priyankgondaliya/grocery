const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const createError = require('http-errors');

const userSchema = new mongoose.Schema ({
    firstname : {
        type:String,
        required:true
    },
    lastname : {
        type:String
    },
    email : {
        type:String,
        required:true,
        unique:true
    },
    password : {
        type:String,
        required:true
    },
    phone : {
        type:Number,
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]

})

// generating tokens
userSchema.methods.generateAuthToken = async function(){
    try {
        console.log(this._id);
        const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token})
        await this.save();
        console.log(token);
        return token;
    } catch (error) {
        next(createError.BadRequest(error));
        console.log("error: "+error);      
    }
}

// converting password into hash
userSchema.pre("save",async function(next){

    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
    }
    next();
})

// we need to create a collection
const User = new mongoose.model("User",userSchema);
module.exports= User;