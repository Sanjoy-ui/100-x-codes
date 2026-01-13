import express from "express"
import dotenv from "dotenv"
dotenv.config()
import db from "./utils/db.js"

const app = express()

app.listen(process.env.PORT , ()=>{
    console.log(`server is running on port ${process.env.PORT}`)
    db()
})
