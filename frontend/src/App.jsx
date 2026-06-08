import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Books from './pages/Books'
import Teachers from './pages/Teachers'
import Classes from './pages/Classes'
import Borrow from './pages/Borrow'
import Returns from './pages/Returns'
import Login from './pages/Login'
import Sidebar from './components/Sidebar'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'))
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <div className="app">
      <Sidebar onLogout={handleLogout} />
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/books" element={<Books />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/borrow" element={<Borrow />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
