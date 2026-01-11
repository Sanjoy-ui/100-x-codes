import { Router } from "express";
import connection from "./db.js";
import { Result } from "postcss";

const router = Router()

const registerUser = async (req, res) => {
    try {
        const { username, email, age, address } = req.body;
        const sql = `INSERT INTO student (username, email, age, address) VALUES (?, ?, ?, ?)`;
        await connection.query(sql, [username, email, age, address]);
        console.log("register route");
        res.status(200).send({ message: "user created" });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "internal database error" });
    }
}

const userLogin = async (req ,res) => {
    try {
        const {username , email } = req.body;
        if(!username) return res.status(401).json({message : "username required"})
        if(!email) return res.status(401).json({message : "email required"})
        const sql = `SELECT * FROM student WHERE email = ? `;
        await connection.query(sql , [email] , (err, Result)=>{
            if(err) return res.status(500).json({message : "server error"})
            console.log(Result)
            res.status(201).json({message : "login successful" , user : Result[0]})
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "unexpected error" });
    }
}

router.route("/signup").post(registerUser)
router.route("/login").get(userLogin)
// router.route("/signup").post(middleware ,(req,res)=>{

// })

export default router