import mongoose from "mongoose";


async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/test")
}

main().then(()=>{
    console.log("connection successful")
}).catch((err)=>{
    console.log(err)
})

// insertdata

const userSchema = new  mongoose.Schema(
    {
        name : String,
        email : String,
        age : Number,
    }

)
const User = mongoose.model("User" , userSchema );


User.findByIdAndDelete({_id : ""}).then()

// User.deleteOne({name : "Sanjoy Deb"})
// .then((res)=> ( console.log("deleted")))

// User.findByIdAndUpdate(
//     { _id : "68b9adb460a85c3e69df4175"},
//     { $set : {age : 21 }},
//     {new : true}
// ).then((res)=>{
//     console.log(res)
// })

// User.updateOne(
//   { name : "trisha " }, 
//   { $set :  {email : "she is good girl"}},
//   { new: true }
// ).then(res => console.log(res));


// User.find({
//     age : {$gt : 20}
// }).then(res => (console.log(res[0].name))).catch((err)=> (console.log(err)))

// User.insertMany([
//     {
//         name : "sanjoy ",
//         email : "yahoo" ,
//         age : 19
//     },
//     {
//         name : "rahul ",
//         email : "gmail" ,
//         age : 25
//     },
//     {
//         name : "trisha ",
//         email : "good girl" ,
//         age : 19
//     }
// ]).then((res)=> (console.log(res))).catch((err)=>{
//     console.log(err)
// })

// const user1 = new User({
//     name : "Sanjoy Deb" ,
//     email : "sanjoydeb404@gmail.com",
//     age : 19,
// })



// user1.save().then((res)=>{
//     console.log(res);

// }).catch((err)=>{
//     console.log(err)
// })



