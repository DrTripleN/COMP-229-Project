require('dotenv').config

const mongoose = require('mongoose')
const express = require ('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
mongoose.connect("mongodb+srv://projectuser:projectpassword@cluster0.ddcuvy2.mongodb.net/OnlineShopMarket")
const app = express()
app.use(express.json())
const User = require("./User")
const routes = require('./routes/userRoutes'); 


app.use('/', routes);



app.listen(3000, () => {
    console.log("Server is Running")
})