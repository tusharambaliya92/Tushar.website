const bcrypt = require("bcryptjs/dist/bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");


const employeeShema = mongoose.Schema({
    firstname: {
        type:String,
        require:true
    },
    lastname: {
        type:String,
        require:true
    },
    phone:{
        type:Number,
        require:true,
        min:10,
        unique:true
    },
    age:{
        type:Number,
        require:true,    
    },
    email: {
        type:String,
        require:true,
        unique:true
    },
    password: {
        type:String,
        require:true,
        
    },
    confirmpassword: {
        type:String,
        require:true
    },
    gender : {
        type:String,
        require:true
    },
    image :{
      type:String,
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
employeeShema.methods.generateAuthtoken = async function(){
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

//converting password into hash
employeeShema.pre("save",async function(next){

    if(this.isModified("password")){
        // const passwordHash = await bcrypt.hash(password,10);
      
        this.password = await bcrypt.hash(this.password,10);
      
        this.confirmpassword = await bcrypt.hash(this.password,10);
    }
  
    next();
})
//now we need to  create a collection

const Register = new mongoose.model("Register",employeeShema)
module.exports = Register;