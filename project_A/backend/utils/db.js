import mysql from "mysql2"

const db = mysql.createConnection({
    host : "localhost",
    user : "root",
    password : "StrongPassword123",
    database : "employ_management"
})

db.connect( (err)=>{
    if(err) return console.log("connection error:", err.message)
    console.log("connected db")
})

export default db