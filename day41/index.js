import express from "express"
import mongoose from "mongoose"
import path from "path"
import { fileURLToPath } from "url";
import { dirname } from "path";
import Chat from "./models/text.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// app.use(express.static(path.join(__dirname) , "public"))

app.set("views", path.join(__dirname , "views"));
app.set("view engine" , "ejs");

app.get("/" , (req,res)=>{
    res.send("working");
})

async function connectDb() {
    await mongoose.connect("mongodb://127.0.0.1:27017/whatsapp")
}

// let chat1 = new Chat({
//     from : "ok",
//     to : "hmm",
//     message : "hallow",
//     created_at : new Date ,
// })



// chat1.save().then(res => console.log(res)).catch(err => console.log(err))

app.get("/chats", async (req,res)=>{
    let chats = await Chat.find();
   console.log(chats);
    res.render("index.ejs" , { chats})
    console.log("working")
})

app.listen(8181 , ()=>{

    connectDb()
    .then((res)=>(console.log("connection successful")))
    .catch((err)=>(console.log(err)));
    console.log("server is running on port 8181");
})