import express from "express"
import db from "../utils/db.js"
import jwt from "jsonwebtoken"

const router = express.Router()

router.post("/adminlogin" , (req,res)=>{
    console.log("first")
    const sql = `SELECT * FROM admin WHERE email = ? and password = ?`
    db.query(sql , [req.body.email , req.body.password] , (err , result)=>{
        if(err) return res.json({loginstatus : false  , Error : "error"})
        if(result.length > 0) {
            const email = result[0].email
            const token = jwt.sign({role : "admin" , email : email } , "siodohfhbcsbvdbufsdfsfeefegeaewg" , {
                expiresIn : '1d'
            })
            res.cookie("token" , token)
            console.log("YE")
            return res.json({loginstatus : true  })
        } else {
            return res.json({loginstatus : false  , Error : "wrong credentials"})
        }
    })
})

export { router as adminRouter}