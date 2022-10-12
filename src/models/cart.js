const mongoose = require('mongoose');

const cart = new mongoose.Schema({
    product :Object,
    user:String,
    qty : Number,
   
})
const cartModel = mongoose.model("addcart",cart);
module.exports = cartModel;