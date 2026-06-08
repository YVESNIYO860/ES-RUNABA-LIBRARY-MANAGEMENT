import React, { useEffect, useState } from 'react'
import { get, post, del } from '../api'
import Loader from '../components/Loader'

const levels = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6']

export default function Classes() {
  const [list, setList] = useState([])
  const [form, setForm] = useState({ level: 'S1', combination: '', description: '' })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!loading) return
    setProgress(12)
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 8 + 4, 92))
    }, 220)
    return () => clearInterval(interval)
  }, [loading])

  async function load() {
    setLoading(true)
    setMessage('Loading class records...')
    setError('')
    try {
      const data = await get('/classes')
      setList(data)
    } catch (err) {
      console.error(err)
      setError('Unable to load class information. Start the backend or check connection.')
      setMessage('Failed to load class information.')
    } finally {
      setProgress(100)
      setLoading(false)
    }
  }

  async function add(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('Saving class record...')
    setError('')
    try {
      await post('/classes', form)
      setForm({ level: 'S1', combination: '', description: '' })
      await load()
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Unable to save class entry.')
      setMessage('Failed to save class record.')
    } finally {
      setProgress(100)
      setLoading(false)
    }
  }

  async function remove(id) {
    if (!confirm('Delete this class record?')) return
    setLoading(true)
    setMessage('Removing class record...')
    try {
      await del('/classes/' + id)
      await load()
    } catch (err) {
      console.error(err)
      setError('Unable to delete class. Please try again.')
      setMessage('Failed to remove class record.')
    } finally {
      setProgress(100)
      setLoading(false)
    }
  }

  const filtered = list.filter(item => {
    const text = `${item.level} ${item.combination} ${item.description}`.toLowerCase()
    return text.includes(search.toLowerCase())
  })

  return (
    <div>
      <Loader active={loading} title="ES RUNABA Library — Classes" message={message} progress={progress} current={filtered.length} total={list.length} />
      <div className="page-header">
        <div>
          <h2>Classes</h2>
          <p className="meta">Store S1–S6 class levels and advanced-level combinations.</p>
        </div>
        <div className="action-note">Use combinations only for S5/S6 advanced level groups.</div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="cards">
        <div className="card">
          <h3>Total class records</h3>
          <p className="large">{list.length}</p>
        </div>
        <div className="card">
          <h3>Filtered</h3>
          <p className="large">{filtered.length}</p>
        </div>
      </div>

      <div className="section-grid">
        <div className="card">
          <h3>Add new class</h3>
          <form onSubmit={add} className="teacher-form">
            <label>Level</label>
            <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
              {levels.map(level => <option key={level} value={level}>{level}</option>)}
            </select>
            <input placeholder="Combination (S5/S6 only)" value={form.combination} onChange={e => setForm({ ...form, combination: e.target.value })} />
            <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <button type="submit">Add Class</button>
          </form>
        </div>

        <div className="card">
          <div className="list-header">
            <h3>Class catalog</h3>
            <input className="search" placeholder="Search classes or combinations" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">No class records found. Add S1–S6 levels and advanced combos.</div>
          ) : (
            <table className="table">
              <thead>
                <tr><th>Level</th><th>Combination</th><th>Description</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item._id}>
                    <td>{item.level}</td>
                    <td>{item.combination || '—'}</td>
                    <td>{item.description || '—'}</td>
                    <td><button className="small-button" onClick={() => remove(item._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
