import mysql from "mysql2/promise"
import dotenv from "dotenv"

dotenv.config()

const connection = await mysql.createConnection({
    // socketPath: "/tmp/mysql.sock",
    host: "localhost",
    user: "root",
    password: process.env.DB_PASS,
    database: "student_management"
})

console.log("Database connected")

export default connection
