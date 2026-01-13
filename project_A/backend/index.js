import express from "express"
import cors from "cors"
import { adminRouter } from "./routes/admin.route.js"
// import db from "./utils/db.js"

const app = express()
app.use(cors({
    origin : "http://localhost:5173",
    methods : ["GET" , "PUT", "POST" , "DELETE" ],
    credentials : true
}))
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use("/auth" ,adminRouter)

app.listen(3000 , ()=>{
    console.log(`server is running `)
    
})