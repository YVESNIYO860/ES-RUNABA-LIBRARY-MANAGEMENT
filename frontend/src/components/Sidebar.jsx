import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import logo from '../runaba-logo.png'

export default function Sidebar({ onLogout, role }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const logout = () => { onLogout(); navigate('/login') }

  const closeMenu = () => setOpen(false)
  const toggleMenu = () => setOpen(prev => !prev)

  const isCompManager = role === 'computer_manager'

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand">
          <img src={logo} alt="ES RUNABA" className="brand-logo" />
          <h2>{isCompManager ? 'ES RUNABA LAB' : 'ES RUNABA LIBRARY'}</h2>
        </div>
        <button
          type="button"
          className="nav-toggle"
          onClick={toggleMenu}
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>
      <nav aria-label="Main navigation">
        <NavLink to="/" end onClick={closeMenu}>Dashboard</NavLink>
        {isCompManager ? (
          <>
            <NavLink to="/computers" onClick={closeMenu}>Computers & Cables</NavLink>
            <NavLink to="/teachers" onClick={closeMenu}>Teachers</NavLink>
            <NavLink to="/borrow" onClick={closeMenu}>Checkout</NavLink>
            <NavLink to="/returns" onClick={closeMenu}>Return</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/books" onClick={closeMenu}>Books</NavLink>
            <NavLink to="/teachers" onClick={closeMenu}>Teachers</NavLink>
            <NavLink to="/classes" onClick={closeMenu}>Classes</NavLink>
            <NavLink to="/borrow" onClick={closeMenu}>Borrow</NavLink>
            <NavLink to="/returns" onClick={closeMenu}>Return</NavLink>
          </>
        )}
      </nav>
      <button type="button" onClick={logout} className="logout">Back</button>
    </aside>
  )
}
