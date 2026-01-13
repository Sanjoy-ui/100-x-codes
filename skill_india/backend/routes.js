import { Router } from "express";
import connection from "./db.js";
import { Result } from "postcss";
import jwt from "jsonwebtoken"

const router = Router()

// create
const registerUser = async (req, res) => {
    try {
        const { username, email, age, address } = req.body;
        const sql = `INSERT INTO student (username, email, age, address) VALUES (?, ?, ?, ?)`;
        await connection.query(sql, [username, email, age, address]);
        const token = jwt.sign({email} , "hshhduihdischsbdvbbvbi" , {expiresIn : "7d"})
        console.log("register route");
        res.status(200).send({ message: "user created" , token } );
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "internal database error" });
    }
}

// read
const userLogin = async (req ,res) => {
    try {
        const {username , email } = req.body;
        if(!username) return res.status(401).json({message : "username required"})
        if(!email) return res.status(401).json({message : "email required"})
        const sql = `SELECT id , username , email FROM student WHERE email = ? `;
        const [rows]= await connection.query(sql , [email] )
        if(rows.length === 0) return res.status(404).json({message : "user not found !"})
        if(rows[0].username !== username) return res.status(404).json({message : "invalid credentials"})
        res.status(200).json({
            message : "login successfull",
            user : rows[0]
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "server login error" });
    }
}

// update 

const updateUser = async (req,res) => {
    try {
        const {id} = req.params;
        const {name , age } = req.body
        const sql = `UPDATE student SET username = ? , age = ? WHERE id = ?`;
         await connection.query(sql , [name , age , id])
        console.log("updated")
        res.status(203).json({message : "user updated" })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({message : "server error"})
    }
}

// delete 
const deleteUser = async (req,res) => {
    try {
        await connection.query(`DELETE FROM student WHERE id = ?`, [req.params.id])
        console.log("user deleted")
        res.status(200).json({ message: "user deleted" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "delete error" })
    }
}

// auth middleware 

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: "token missing" })
        const token = authHeader.split(" ")[1];
        if (!token) return res.status(401).json({ message: "token missing" })
        const decode = jwt.verify(token, "hshhduihdischsbdvbbvbi")
        req.user = decode;
        next()
    } catch (error) {
        return res.status(401).json({ message: "invalid token" })
    }
}




 // "email": "rahul@test.com"
router.route("/signup").post(registerUser)
router.route("/login").get(userLogin)
router.route("/update/:id").put( authMiddleware, updateUser)
router.route("/delete/:id").delete(deleteUser)
// router.route("/signup").post(middleware ,(req,res)=>{

// })

export default router