import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { post } from '../api'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    const res = await post('/auth/login', { username, password })
    if (res.token) {
      onLogin(res.token)
      nav('/')
    } else alert(res.msg || 'Login failed')
  }

  return (
    <div className="login-page">
      <form onSubmit={submit} className="card">
        <h3>Librarian & IT Login</h3>
        <input placeholder="username" value={username} onChange={e => setUsername(e.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button>Login</button>
      </form>
    </div>
  )
}
