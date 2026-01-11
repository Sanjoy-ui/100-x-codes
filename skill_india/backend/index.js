
import express from "express";
import router from "./routes.js";
import "./db.js";

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended : true}))

// await connection.query(`
//     CREATE DATABASE student_management;
//     `)
// const [databases] = await connection.query(`SHOW DATABASES`);
// console.log("Databases:", databases);

// Select the database first
// await connection.query(`USE student_management`)

// await connection.query(`CREATE TABLE student (
//         id INT NOT NULL AUTO_INCREMENT UNIQUE ,
//         username varchar(40) NOT NULL,
//         age INT ,
//         email varchar(30),
//         address varchar(100),
//          PRIMARY KEY (id)
//     )`)



// console.log("connection successful")



app.use("/user/v1/", router)
app.use("/user/v1",router )

app.listen(4000, ()=>{
    console.log("server running ");
    
})