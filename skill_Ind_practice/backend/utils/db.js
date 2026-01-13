import mysql from "mysql2/promise"

const db = async () => {
    try {
        await mysql.createConnection({
  host: 'localhost',
  user: 'root',
//   database: 'test',
    password : process.env.DB_PASS
});
console.log("db connected")
    } catch (error) {
        console.log("db connection error")
    }
}

export default db

