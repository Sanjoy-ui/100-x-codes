import mongoose from "mongoose";
import Chat from "./models/text.js";


async function connectDb() {
    await mongoose.connect("mongodb://127.0.0.1:27017/whatsapp")
}
connectDb()
    .then((res)=>(console.log("connection successful")))
    .catch((err)=>(console.log(err)));

Chat.insertMany([
  {
    from: "sanjoy",
    to: "hathi",
    message: "so cute awww",
    created_at: new Date()
  },
  {
    from: "hathi",
    to: "sanjoy",
    message: "haha thank you 🐘💖",
    created_at: new Date()
  },
  {
    from: "sanjoy",
    to: "trisha",
    message: "hey, how are you?",
    created_at: new Date()
  },
  {
    from: "trisha",
    to: "sanjoy",
    message: "I’m good, what about you?",
    created_at: new Date()
  },
  {
    from: "sanjoy",
    to: "rahul",
    message: "Bro, let’s meet tomorrow.",
    created_at: new Date()
  },
  {
    from: "rahul",
    to: "sanjoy",
    message: "Sure, what time?",
    created_at: new Date()
  }
])
  .then(res => console.log("Chats inserted:", res))
  .catch(err => console.log(err));
