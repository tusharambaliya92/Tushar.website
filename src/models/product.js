const mongoose = require("mongoose");
// const jwt = require("jsonwebtoken");

const productShema = mongoose.Schema({
    id:{
        type:String,
        unique:true,
        require:true
    },
    image:{
        type:String,
        require:true
    },
    title: {
    type:String,
    require:true
    },
    price:{
        type:Number,
         require:true
    },
    

    tokens:[{
        token:{
            type:String,
            require:true
        }
    }]

})

//generating token
productShema.methods.generateAuthtoken = async function(){
     try {
         console.log(this._id)
         const token = jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
         this.tokens = this.tokens.concat({token:token})
         await this.save();
         return token;
     } catch (error) {
         res.send("the part error" + error)
         console.log("the part error" + error)

         
     }
}


//now we need to  create a collection

const product = new mongoose.model("product",productShema)
module.exports = product;