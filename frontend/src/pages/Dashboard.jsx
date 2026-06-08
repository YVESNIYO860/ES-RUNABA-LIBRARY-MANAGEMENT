import React, { useEffect, useState } from 'react'
import { get } from '../api'
import Loader from '../components/Loader'

export default function Dashboard() {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setMessage('Loading ES RUNABA dashboard...')
      try {
        const books = await get('/books')
        const teachers = await get('/teachers')
        const borrows = await get('/borrows')
        const totalBooks = Array.isArray(books) ? books.reduce((s,b)=>s+b.total,0) : 0
        const available = Array.isArray(books) ? books.reduce((s,b)=>s+b.available,0) : 0
        const categories = Array.isArray(books)
          ? books.reduce((acc, book) => {
              const key = book.category || 'General'
              acc[key] = (acc[key] || 0) + 1
              return acc
            }, {})
          : {}
        setStats({
          totalBooks,
          available,
          totalTeachers: Array.isArray(teachers)?teachers.length:0,
          borrowedBooks: Array.isArray(borrows)? borrows.reduce((s,b)=> s + b.books.reduce((ss,bb)=> ss + (bb.quantity - bb.returned),0),0):0,
          overdue: Array.isArray(borrows)? borrows.filter(x=>x.overdue).length:0,
          categories
        })
      } catch (error) {
        console.error(error)
        setMessage('Failed to load ES RUNABA dashboard.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const categoryEntries = stats.categories ? Object.entries(stats.categories) : []

  return (
    <div>
      <Loader active={loading} title="ES RUNABA Library — Dashboard" message={message} />
      <h2>Dashboard</h2>
      <div className="cards">
        <div className="card">Total books: <strong>{stats.totalBooks}</strong></div>
        <div className="card">Available: <strong>{stats.available}</strong></div>
        <div className="card">Teachers: <strong>{stats.totalTeachers}</strong></div>
        <div className="card">Borrowed books: <strong>{stats.borrowedBooks}</strong></div>
        <div className="card">Overdue txns: <strong>{stats.overdue}</strong></div>
      </div>
      <div className="card">
        <h3>Book Categories</h3>
        <ul>
          {categoryEntries.length ? categoryEntries.map(([name, count]) => (
            <li key={name}>{name}: {count}</li>
          )) : <li>No categories yet</li>}
        </ul>
      </div>
    </div>
  )
}
