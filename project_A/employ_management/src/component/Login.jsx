import React from 'react'
import "bootstrap/dist/css/bootstrap.min.css"
import './style.css'
import { useState } from 'react'
import axios from "axios"

function Login() {
    const [values , setValues ] = useState({
        email : '',
        password : ''
    })

    const handleSubmit = (e)=>{
        e.preventDefault()
        axios.post("http://localhost:3000/auth/adminlogin" , values).then(result => console.log(result)).catch(err => console.log(err))
    }

  return (
    <div className='d-flex justify-content-center align-items-center vh-100 loginPage'>
        <div className='p-3 rounded w-25 border loginForm'>
            <h2>Login page</h2>
            <form onSubmit={handleSubmit}>
                <div className='mb-3'>
                    <label htmlFor="email"><strong>Email :</strong> </label>
                    <input onChange={(e)=>{setValues({...values , email : e.target.value})}} className='form-control rounded-0' type="text" name='email' autoComplete='off' placeholder='Enter email' />
                </div>
                <div className='mb-3'>
                    <label htmlFor="email"><strong>Password :</strong> </label>
                    <input onChange={(e)=>{setValues({...values , password : e.target.value})}} className='form-control rounded-0' type="password" name='password'  placeholder='Enter password' />
                </div>
                <button className='mb-2 btn btn-success w-100 rounded-0'>Log in</button>
                <div className='mb-1'>
                    <input type="checkbox" className='me-2' name="tick" id="tick" />
                    <label htmlFor="email"><strong>you agree terms and conditions</strong> </label>
                    
                </div>
            </form>
        </div>
    </div>
  )
}

export default Login