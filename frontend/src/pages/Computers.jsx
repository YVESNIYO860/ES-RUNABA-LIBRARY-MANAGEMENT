import React, { useEffect, useState } from 'react'
import { get, post, del } from '../api'
import Loader from '../components/Loader'

export default function Computers() {
  const [list, setList] = useState([])
  const [form, setForm] = useState({ name: '', serialNumber: '', type: 'computer', total: 1 })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(0)

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!loading) return
    setProgress(12)
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 8 + 4, 92))
    }, 200)
    return () => clearInterval(interval)
  }, [loading])

  async function load() {
    setLoading(true)
    setProgress(10)
    setMessage('Loading computer inventory...')
    try {
      const data = await get('/computers')
      setList(data)
    } catch (error) {
      console.error(error)
      setMessage('Failed to load computer list.')
    } finally {
      setProgress(100)
      setLoading(false)
    }
  }

  async function add(e) {
    e.preventDefault()
    setLoading(true)
    setProgress(8)
    setMessage('Saving new device/cable...')
    try {
      await post('/computers', form)
      setForm({ name: '', serialNumber: '', type: 'computer', total: 1 })
      await load()
    } catch (error) {
      console.error(error)
      setMessage(error.msg || 'Failed to save new device.')
    } finally {
      setProgress(100)
      setLoading(false)
    }
  }

  async function remove(id) {
    if (confirm('Delete this device/cable?')) {
      setLoading(true)
      setMessage('Removing device...')
      try {
        await del('/computers/' + id)
        await load()
      } catch (error) {
        console.error(error)
        setMessage('Failed to remove item.')
      } finally {
        setProgress(100)
        setLoading(false)
      }
    }
  }

  return (
    <div>
      <Loader active={loading} title="ES RUNABA Lab — Computers" message={message} progress={progress} />
      <h2>Computers & Cables Management</h2>
      <p className="meta">Inventory contains {list.length} item{list.length === 1 ? '' : 's'}.</p>
      
      <form onSubmit={add} className="card small">
        <input placeholder="Name/Model" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Serial Number / Tag" value={form.serialNumber} onChange={e => setForm({ ...form, serialNumber: e.target.value })} required />
        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
          <option value="computer">Computer 🖥</option>
          <option value="cable">Cable / Accessories 🔌</option>
        </select>
        <input placeholder="Total Stock" type="number" value={form.total} onChange={e => setForm({ ...form, total: Number(e.target.value) })} required min="1" />
        <button type="submit">Add Item</button>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>Name / Model</th>
            <th>Serial Number</th>
            <th>Type</th>
            <th>Total Stock</th>
            <th>Available</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map(c => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td><code>{c.serialNumber}</code></td>
              <td>
                <span className={`badge ${c.type === 'computer' ? 'badge-success' : 'badge-danger'}`} style={{ textTransform: 'capitalize' }}>
                  {c.type}
                </span>
              </td>
              <td>{c.total}</td>
              <td>{c.available}</td>
              <td>
                <button onClick={() => remove(c._id)} className="logout" style={{ width: 'auto', marginTop: 0, padding: '6px 12px', borderRadius: '4px' }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr>
              <td colSpan="6" className="empty-state">No computers or cables in the catalog yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
