const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin:admin123@cluster0.jxdqx.mongodb.net/grocery?retryWrites=true&w=majority',{
    useNewURlParser:true,
    useUnifiedTopology:true,
    // useCreateIndex:true
}).then(()=>{
    console.log('connection successful');
}).catch((e)=>{
    console.log('not connected');
})