require('dotenv').config();
const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");
const createError = require('http-errors');

require("./db/conn");

const port = process.env.PORT || 3000;
// const static_path = path.join(__dirname,"../public");
const template_path = path.join(__dirname,"../templates/views");
const partials_path = path.join(__dirname,"../templates/partials");
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

// app.use(express.static(static_path));

app.set("view engine","hbs");
app.set("views",template_path);
hbs.registerPartials(partials_path);

// Routes
app.use('/', require('./routes/authRoutes'));

app.get("/",(req,res)=>{
    res.render("index");
});
app.get("/secret",auth,(req,res)=>{
    console.log(`this is the cookie awesome ${req.cookies.jwt}`);
    res.render("secret");
});

app.all('*', (req, res, next) => {
    next(createError.NotFound(`${req.originalUrl} not found!`))
});

// error handler
app.use((err, req, res, next) =>{
    res.status(err.status || 500).json({
        status: "fail",
        message: err.message,
    })
})

app.listen(port,()=>{
    console.log(`server is running on the port ${port}`);
})