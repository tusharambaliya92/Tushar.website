const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost:27017/RegLog").then(()=>{
    console.log("connetion success")
}).catch((e)=>{
    console.log("no connection")
})



// mongoose.connect("mongodb+srv://tushar:tushar31@cluster0.tfgo6je.mongodb.net/RegLog?retryWrites=true&w=majority").then(()=>{
//     console.log("connetion success new")
// }).catch((e)=>{
//     console.log("no connection new")
// })
