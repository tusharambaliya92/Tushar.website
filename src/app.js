require('dotenv').config()
const express = require("express")
const path = require("path")
const app = express()
const cors = require('cors');
const hbs = require("hbs")
const bcrypt = require("bcryptjs")
const product = require("./models/product")
const cartModel = require("./models/cart")
const purchaseModel = require("./models/payment")
const port = process.env.PORT || 3500
const cookieParser = require("cookie-parser")
const auth = require("./middleware/auth")
require("./db/conn")
const Register = require("./models/registers")
const static_path = path.join(__dirname,"../public")
const tempalete_path = path.join(__dirname,"../templates/views")
const partials_path = path.join(__dirname,"../templates/partials")
app.use(cors());
app.use(cors({
    origin:"http://localhost:3000",
}))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended:false}))

app.use(express.static(static_path ))
const multer  = require('multer')
app.set("view engine","hbs")
app.set("views",tempalete_path)
hbs.registerPartials(partials_path)



// storage engine 
const storage = multer.diskStorage({
    destination: 'public/images/',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({
    storage: storage,
}).single('file')

app.get("/",(req,res)=>{
    
    res.render("register")
})

app.get("/Orders",auth,async(req,res)=>{
    const addtocart = await purchaseModel.find({customerId:req.user._id}).populate("customerId")
    console.log(addtocart);
    // console.log(req.user);
    let user = req.user;
    res.render("index",{addtocart,user},);
})
app.get("/user",auth,(req,res)=>{
    // console.log(`this is cookies : ${req.cookies.jwt}`);
    let user = req.user;
    res.render("user",{user})
})

app.get("/logout",auth, async (req,res)=>{
    // console.log(req.cookies.jwt);
   try {
        console.log(req.user)
        
        // for single logout

        // req.user.tokens = req.user.tokens.filter((currElem)=>{
        //       return currElem.token !== req.token;
        // })

        //logout form all devices
        req.user.tokens = []; 

       res.clearCookie("jwt");
       console.log("logout successfull");
       await req.user.save();
       res.render("login")
   } catch (error) {
       res.status(500).send(error);
   }
})

app.get('/addtocart/:id',auth,async(req,res)=>{
    // console.log(req.params.id);
    let data = await product.findById({_id:req.params.id})
    
    // console.log(data);
    let newCart = new cartModel({
        product:data,
        user:req.user._id,
        qty:1,
      
    })
    
    await newCart.save();


    res.redirect("/cart");
})

app.get("/cart",auth,async(req,res)=>{
    
    const addtocart = await cartModel.find({user:req.user._id})
     let total = 0;
     addtocart.forEach((e) => {
         total += (e.product.price * e.qty)
       
     });
     let user = req.user;
     res.render("cart",{addtocart,total,user})
})

app.get("/deletecart/:id",auth,async(req,res)=>{
    const cartdelete = await cartModel.findByIdAndDelete({_id:req.params.id})
    // console.log(cartdelete);
    res.redirect("/cart");

})


app.get("/register",async(req,res)=>{
    const registerData = await Register.find()
    // res.json(registerData)
    // console.log(registerData)
    res.render("register")
    
})

app.get("/login",(req,res)=>{
    res.render("login")
})
app.post("/product",auth,async(req,res)=>{
    
    try {
        const user = new  product(req.body)
        const createUser = await user.save();
        res.status(201).send(createUser);
        res.render("product")
    } catch (e) {
        res.status(400).send(e)
    }
   
})

app.get("/product",auth,async(req,res)=>{
    try {
          var search = "";
          if (req.query.search) {
              search = req.query.search;
          }
        const productData = await product.find(
          
              {title:{$regex:'.*'+search+'.*',$options:'i'}}   
        )
        const addtocart = await cartModel.find({user:req.user._id})
        let total = 0;
        addtocart.forEach((e) => {
            total += (e.product.price * e.qty)
          
        });
        let user = req.user;
        res.render("product",{productData,addtocart,user})
    } catch (e) {
        console.log(e);
       

    }
 
})



app.post("/order",auth,async (req,res)=>{
    const addtocart = await cartModel.find({user:req.user._id})
    let total = 0;
    addtocart.forEach((e) => {
        total += (e.product.price * e.qty)     
    });

    try {
        const pay = new purchaseModel({
            customerId:req.user._id,
            cartdata:addtocart,
            price:total, 
            phone:req.body.phone,
            address:req.body.address
        })
        console.log(pay);
        const User = await pay.save();
         
        // res.status(201).send(User);
        res.redirect("Orders")
    } catch (e) {
        res.status(400).send(e)
    }
})

app.get("/order",async(req,res)=>{
    const purchaseData = await purchaseModel.find()
    // console.log(purchaseData)
    res.render("order",{purchaseData}) 
})

//create a new user in our database
app.post("/register",upload,async (req,res)=>{
    
   try {
         
          const password = req.body.password;
          const cpassword = req.body.confirmpassword;

          if(password === cpassword ){
             const registeremp = new Register({
                firstname:req.body.firstname,
                lastname:req.body.lastname,
                phone:req.body.phone,
                age:req.body.age,
                email:req.body.email,
                password:password,
                confirmpassword:cpassword,
                gender:req.body.gender,  
                image:req.file.filename,  
             })
             var fileinfo = req.file;
            //  var success = req.file.filename+"upload successfully";
             console.log("the success part" + registeremp);
              
             const token = await registeremp.generateAuthtoken(); 
             console.log("the token part" + token);
             
            res.cookie("jwt",token,{
                expires:new Date(Date.now() + 6000000),
                httpOnly:true
            });
     

             const registered = await registeremp.save();
             console.log("the page part" + registered);
        
             res.status(201).redirect("product")
          }else{
              res.send("password are not match")
          }

   } catch (error) {
       res.status(400).send(error)
       
   }
})



//login check

app.post("/login",async(req,res)=>{
   try {
    const email = req.body.email;
    const password = req.body.password;

    const useremail = await Register.findOne({email:email})

    const isMatch = await bcrypt.compare(password,useremail.password);
    
    const token = await useremail.generateAuthtoken(); 
    console.log("the token part " + token);
    
    res.cookie("jwt",token,{
        expires:new Date(Date.now() + 6000000),
        httpOnly:true,
        // secure:true
    });

       if(isMatch){
   
        res.status(201).redirect("product")
 
    }else{
        res.send("Invalid Login Details")
    }
   } catch (error) {
    res.status(400).send("Invalid Login Details")
       
   }
})
app.get("*",(req,res)=>{
   res.render("error")
})

const jwt = require("jsonwebtoken");
const { get } = require('http');

const createToken = async () =>{
   const token = await jwt.sign({_id:"6305a65642d4eaf6cfdb9d12"},process.env.SECRET_KEY,{
       expiresIn:"10 second"
   });
//    console.log(token)

   const userVer = await jwt.verify(token,process.env.SECRET_KEY)
//    console.log(userVer)
}
createToken()

app.listen(port,() =>{
    console.log(`connection is live port no. ${port}`)
})