import React from 'react'
import '../css/loginPage.css'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { API_BASE, getJson } from '../utils/api.js'

export default function LoginPage() {
  const [loginInfo, setLoginInfo] = React.useState({
    email: '',
    password: ''
  })
  const navigate = useNavigate();
  const { login } = useAuth()
  const { showToast } = useToast()
  const handleChange = (e) => {
    setLoginInfo((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {email,password} = loginInfo

    if(!email||!password){
      showToast('Email and password are required', 'error')
      return ;
    }
    try {
      const response = await fetch(`${API_BASE}/auth/login`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginInfo)
      })
      const data = await getJson(response)
      const {success,token,role,username} = data
      if(success){
        login({ token, role, username })
        setTimeout(() => {
          if (role === 'admin') navigate('/admin')
          else if (role === 'instructor') navigate('/teacher')
          else navigate('/student')
        }, 200);
        showToast('Login successful', 'success')
      }
    } catch (error) {
      showToast(error.message || 'Login failed', 'error')
    }
  }

  return (
    <div className="login-page">
      <div className="main-login-container">
        <h2>Login to SRMS</h2>
        <form onSubmit={handleSubmit}>
          <div className="inputs-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="enter your email"
              value={loginInfo.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="inputs-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="enter your password"
              value={loginInfo.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  )
}
