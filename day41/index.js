import express from "express"
import mongoose from "mongoose"
import path from "path"
import { fileURLToPath } from "url";
import { dirname } from "path";
import Chat from "./models/text.js";
import methodOverride from 'method-override';



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(methodOverride("_method"));

// app.use(express.static(path.join(__dirname) , "public"))

app.set("views", path.join(__dirname , "views"));
app.set("view engine" , "ejs");

app.get("/" , (req,res)=>{
    res.send("working");
})

app.get("/chats/new", (req,res)=>{
    res.render("form.ejs");
});

app.post("/chats",async (req ,res)=>{
    let {from , message , to }= req.body ;
    Chat.insertOne({
        from : from,
        message ,
        to,
        created_at : new Date()
    }).then(res => console.log(res)).catch(err => console.log(err));
    let data = await Chat.find()
    res.render("index.ejs", { chats : data})
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


app.put("/chats/:id", async (req,res)=>{
    let {id} = req.params;
    let {message : newMsg} = req.body;
    console.log(newMsg)
    
    try {
        
        let updateChat = await Chat.findByIdAndUpdate(id, {
            message : newMsg,
            created_at : new Date()
        }, {runValidators : true , new : true})
        console.log(updateChat)
        res.redirect("/chats")
    } catch (err) {
        console.log(err);
        res.status(500).send("Error updating chat");
    }
})

app.get("/chats/:id/edit",async (req,res)=>{
    let {id}= req.params;
    let chat =await Chat.findById(id)
    res.render("edit.ejs" , {chat})
})

app.get("/chats", async (req,res)=>{
    let chats = await Chat.find();
//    console.log(chats);
    res.render("index.ejs" , { chats})
    console.log("working")
})

app.listen(8181 , ()=>{

    connectDb()
    .then((res)=>(console.log("connection successful")))
    .catch((err)=>(console.log(err)));
    console.log("server is running on port 8181");
})