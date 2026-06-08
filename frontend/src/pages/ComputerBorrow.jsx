import React, { useEffect, useState } from 'react'
import { get, post } from '../api'
import Loader from '../components/Loader'

export default function ComputerBorrow() {
  const [teachers, setTeachers] = useState([])
  const [items, setItems] = useState([])
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
    setMessage('Loading computer inventory and teachers...')
    setError('')
    try {
      const [teachersData, itemsData] = await Promise.all([get('/teachers'), get('/computers')])
      setTeachers(teachersData)
      setItems(itemsData)
    } catch (err) {
      console.error(err)
      setError('Unable to load data. Make sure the backend server is running.')
      setMessage('Failed to load lab checkout data.')
    } finally {
      setProgress(100)
      setLoading(false)
    }
  }

  const filteredItems = items.filter(item => {
    const query = search.toLowerCase()
    return (
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.serialNumber.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query)
    )
  })

  function addToCart(item) {
    const existing = cart.find(c => c.computerId === item._id)
    const available = item.available || 0
    if (available < 1) return alert('This item is currently out of stock.')
    if (existing) {
      if (existing.quantity >= available) return alert('No more available stock.')
      setCart(cart.map(c => c.computerId === item._id ? { ...c, quantity: c.quantity + 1, available } : c))
    } else {
      setCart([...cart, { computerId: item._id, name: item.name, quantity: 1, available, type: item.type }])
    }
  }

  function updateQty(id, q) {
    const quantity = Math.max(1, Number(q) || 1)
    setCart(cart.map(c => c.computerId === id ? { ...c, quantity: Math.min(quantity, c.available || 1) } : c))
  }

  function removeFromCart(id) {
    setCart(cart.filter(c => c.computerId !== id))
  }

  async function confirmBorrow() {
    if (!teacher) return alert('Select a teacher first')
    if (cart.length === 0) return alert('Add computers or cables to the cart')
    if (!dueDate) return alert('Choose a due date for return')

    setLoading(true)
    setProgress(8)
    setMessage('Saving checkout record...')
    setError('')
    try {
      const body = {
        teacherId: teacher,
        items: cart.map(c => ({ computerId: c.computerId, quantity: c.quantity })),
        dueDate
      }
      const res = await post('/computer-borrows', body)
      if (res._id) {
        alert('Checkout session created successfully.')
        setCart([])
        setDueDate('')
        loadData()
      } else {
        throw new Error(res.msg || 'Checkout failed')
      }
    } catch (err) {
      console.error(err)
      setError('Unable to save checkout log. Please try again.')
      setMessage('Failed to complete lab checkout.')
    } finally {
      setProgress(100)
      setLoading(false)
    }
  }

  return (
    <div>
      <Loader active={loading} title="ES RUNABA Lab — Checkout" message={message} progress={progress} />
      <div className="page-header">
        <div>
          <h2>Daily Checkout (Computers & Cables)</h2>
          <p className="meta">Assign computers and cables to teachers with custom due dates.</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="row">
        <div className="col">
          <div className="card">
            <h3>Teacher / Staff</h3>
            <select value={teacher} onChange={e => setTeacher(e.target.value)}>
              <option value="">-- Select teacher --</option>
              {teachers.map(t => <option key={t._id} value={t._id}>{t.fullName}</option>)}
            </select>
          </div>

          <div className="card">
            <div className="list-header">
              <h3>Search Inventory</h3>
              <input className="search" placeholder="Search by model, serial number, type" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="list">
              {filteredItems.length === 0 ? (
                <div className="empty-state">No computers or cables matched your query.</div>
              ) : (
                filteredItems.map(item => (
                  <div key={item._id} className="list-item">
                    <div>
                      <strong>{item.name}</strong>
                      <div style={{ fontSize: '0.9rem', color: '#4d5e77' }}>
                        Type: <span style={{ textTransform: 'capitalize' }}>{item.type}</span> · Tag: <code>{item.serialNumber}</code>
                      </div>
                      <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Available stock: {item.available} / {item.total}</div>
                    </div>
                    <button onClick={() => addToCart(item)}>Add</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card">
            <h3>Checkout Cart</h3>
            {cart.length === 0 ? (
              <div className="empty-state">Cart is empty. Select items from the list.</div>
            ) : (
              cart.map(item => (
                <div key={item.computerId} className="cart-row">
                  <div>
                    <strong>{item.name}</strong>
                    <div style={{ fontSize: '0.85rem', color: '#4d5e77' }}>
                      {item.type === 'computer' ? '🖥 Computer' : '🔌 Cable'} (Stock: {item.available})
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="number" min="1" max={item.available} value={item.quantity} onChange={e => updateQty(item.computerId, e.target.value)} />
                    <button className="small-button" onClick={() => removeFromCart(item.computerId)}>Remove</button>
                  </div>
                </div>
              ))
            )}

            <label style={{ display: 'block', marginTop: '16px', fontWeight: 600 }}>Due Date</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            <button onClick={confirmBorrow} style={{ width: '100%', marginTop: '16px' }}>Confirm Checkout</button>
          </div>
        </div>
      </div>
    </div>
  )
}
