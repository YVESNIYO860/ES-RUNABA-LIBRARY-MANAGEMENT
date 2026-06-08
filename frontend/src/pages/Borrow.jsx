import React, { useEffect, useState } from 'react'
import { get, post } from '../api'
import Loader from '../components/Loader'

export default function Borrow(){
  const [teachers, setTeachers] = useState([])
  const [books, setBooks] = useState([])
  const [cart, setCart] = useState([])
  const [teacher, setTeacher] = useState('')
  const [search, setSearch] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!loading) return
    setProgress(12)
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 8 + 2, 88))
    }, 220)
    return () => clearInterval(interval)
  }, [loading])

  async function loadData() {
    setLoading(true)
    setProgress(10)
    setMessage('Loading ES RUNABA borrow data...')
    setError('')
    try {
      const [teachersData, booksData] = await Promise.all([get('/teachers'), get('/books')])
      setTeachers(teachersData)
      setBooks(booksData)
    } catch (err) {
      console.error(err)
      setError('Unable to load borrow data. Check that the backend server is running.')
      setMessage('Failed to load ES RUNABA borrow data.')
    } finally {
      setProgress(100)
      setLoading(false)
    }
  }

  const filteredBooks = books.filter(book => {
    const query = search.toLowerCase()
    return (
      !query ||
      book.title.toLowerCase().includes(query) ||
      (book.author || '').toLowerCase().includes(query) ||
      (book.category || '').toLowerCase().includes(query)
    )
  })

  function addToCart(book){
    const existing = cart.find(c => c.bookId === book._id)
    const available = book.available || 0
    if (available < 1) return alert('This book is not available at the moment.')
    if (existing) {
      if (existing.quantity >= available) return alert('No more copies available for this book.')
      setCart(cart.map(c => c.bookId === book._id ? { ...c, quantity: c.quantity + 1, available } : c))
    } else {
      setCart([...cart, { bookId: book._id, title: book.title, quantity: 1, available }])
    }
  }

  function updateQty(id, q){
    const quantity = Math.max(1, Number(q) || 1)
    setCart(cart.map(c => c.bookId === id ? { ...c, quantity: Math.min(quantity, c.available || 1) } : c))
  }

  function removeFromCart(id){
    setCart(cart.filter(c => c.bookId !== id))
  }

  async function confirmBorrow(){
    if (!teacher) return alert('Select a teacher first')
    if (cart.length === 0) return alert('Add books to the cart before borrowing')
    if (!dueDate) return alert('Choose a due date for the borrow transaction')

    setLoading(true)
    setProgress(8)
    setMessage('Saving ES RUNABA borrow transaction...')
    setError('')
    try {
      const body = { teacherId: teacher, books: cart.map(c => ({ bookId: c.bookId, quantity: c.quantity })), dueDate }
      const res = await post('/borrows', body)
      if (res._id) {
        alert('Borrow transaction saved successfully.')
        setCart([])
        setDueDate('')
        loadData()
      } else {
        throw new Error(res.msg || 'Borrow failed')
      }
    } catch (err) {
      console.error(err)
      setError('Unable to save borrow transaction. Please try again.')
      setMessage('Failed to save ES RUNABA borrow transaction.')
    } finally {
      setProgress(100)
      setLoading(false)
    }
  }

  return (
    <div>
      <Loader active={loading} title="ES RUNABA Library — Borrow" message={message} progress={progress} />
      <div className="page-header">
        <div>
          <h2>Borrow</h2>
          <p className="meta">Search books, select quantities, and save teacher borrow records.</p>
        </div>
        <div className="action-note">Use the search box to find titles, then choose how many copies the teacher is borrowing.</div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="row">
        <div className="col">
          <div className="card">
            <h3>Teacher</h3>
            <select value={teacher} onChange={e => setTeacher(e.target.value)}>
              <option value="">-- Select teacher --</option>
              {teachers.map(t => <option key={t._id} value={t._id}>{t.fullName}</option>)}
            </select>
          </div>

          <div className="card">
            <div className="list-header">
              <h3>Search books</h3>
              <input className="search" placeholder="Search by title, author, or category" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="list">
              {filteredBooks.length === 0 ? (
                <div className="empty-state">No books match your search. Try a different title or author.</div>
              ) : (
                filteredBooks.map(book => (
                  <div key={book._id} className="list-item">
                    <div>
                      <strong>{book.title}</strong>
                      <div style={{ fontSize:'0.9rem', color:'#4d5e77' }}>{book.author || 'Unknown author'} · {book.category || 'General'}</div>
                      <div style={{ fontSize:'0.85rem', marginTop:'4px' }}>Available: {book.available}</div>
                    </div>
                    <button onClick={() => addToCart(book)}>Add</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card">
            <h3>Borrow cart</h3>
            {cart.length === 0 ? (
              <div className="empty-state">No books selected. Add titles from the list to start the borrow transaction.</div>
            ) : (
              cart.map(item => (
                <div key={item.bookId} className="cart-row">
                  <div>
                    <strong>{item.title}</strong>
                    <div style={{ fontSize:'0.9rem', color:'#4d5e77' }}>Max available: {item.available}</div>
                  </div>
                  <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                    <input type="number" min="1" max={item.available} value={item.quantity} onChange={e => updateQty(item.bookId, e.target.value)} />
                    <button className="small-button" onClick={() => removeFromCart(item.bookId)}>Remove</button>
                  </div>
                </div>
              ))
            )}

            <label>Due date</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            <button onClick={confirmBorrow}>Confirm Borrow</button>
          </div>
        </div>
      </div>
    </div>
  )
}
