const mongoose = require('mongoose');

let purchase = new mongoose.Schema({
     customerId:{
         type:mongoose.Schema.Types.ObjectId,
         ref: 'Register',
         require:true
     },
     cartdata:{
        type:Array,
        require:true
      },
    phone:{
        type:Number,
        require:true,
    },
    address:{
        type:String,
         require
    },
    name:{
        type:String,
        require:true
      },
  
    price:{
        type:Number,
        require:true
      },
    payment:{
        type:String,
        default:'COD'
    },
    status:{
        type:String,
        default:'order_placed'
    },
 
})

const purchaseModel = new mongoose.model("paymentData",purchase);
module.exports = purchaseModel;