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

// New Computer Lab Manager pages
import ComputerDashboard from './pages/ComputerDashboard'
import Computers from './pages/Computers'
import ComputerBorrow from './pages/ComputerBorrow'
import ComputerReturns from './pages/ComputerReturns'

// Pure JS JWT decoder
function decodeToken(token) {
  if (!token) return null
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

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

  const decoded = decodeToken(token)
  const role = decoded ? decoded.role : 'librarian'

  if (role === 'computer_manager') {
    return (
      <div className="app">
        <Sidebar onLogout={handleLogout} role={role} />
        <main className="main">
          <Routes>
            <Route path="/" element={<ComputerDashboard />} />
            <Route path="/computers" element={<Computers />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/borrow" element={<ComputerBorrow />} />
            <Route path="/returns" element={<ComputerReturns />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <Sidebar onLogout={handleLogout} role={role} />
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
