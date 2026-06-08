import React, { useEffect, useState } from 'react'
import { get, post, del } from '../api'
import Loader from '../components/Loader'

export default function Teachers(){
  const [list, setList] = useState([])
  const [form, setForm] = useState({fullName:'', phone:'', email:''})
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

  async function load(){
    setLoading(true)
    setProgress(10)
    setMessage('Loading ES RUNABA teachers...')
    setError('')
    try {
      const data = await get('/teachers')
      setList(data)
    } catch (error) {
      console.error(error)
      setError('Unable to connect to the backend. Please start the API server.')
      setMessage('Failed to load ES RUNABA teachers.')
    } finally {
      setProgress(100)
      setLoading(false)
    }
  }

  async function add(e){
    e.preventDefault()
    setLoading(true)
    setProgress(8)
    setMessage('Saving ES RUNABA teacher...')
    try {
      await post('/teachers', form)
      setForm({fullName:'',phone:'',email:''})
      await load()
    } catch (error) {
      console.error(error)
      setMessage('Failed to save ES RUNABA teacher.')
    } finally {
      setProgress(100)
      setLoading(false)
    }
  }

  async function remove(id){
    if(confirm('Delete this teacher?')){
      setLoading(true)
      setProgress(8)
      setMessage('Removing ES RUNABA teacher...')
      try {
        await del('/teachers/'+id)
        await load()
      } catch (error) {
        console.error(error)
        setMessage('Failed to remove ES RUNABA teacher.')
      } finally {
        setProgress(100)
        setLoading(false)
      }
    }
  }

  const visibleTeachers = list.filter(t => t.fullName.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <Loader active={loading} title="ES RUNABA Library — Teachers" message={message} progress={progress} current={visibleTeachers.length} total={list.length} />
      <div className="page-header">
        <div>
          <h2>Teachers</h2>
          <p className="meta">Add, search, and manage faculty data for the library.</p>
        </div>
        <div className="action-note">Keep teacher records up to date so borrowing stays organized.</div>
      </div>

      <div className="cards">
        <div className="card">
          <h3>Total teachers</h3>
          <p className="large">{list.length}</p>
        </div>
        <div className="card">
          <h3>Filtered results</h3>
          <p className="large">{visibleTeachers.length}</p>
        </div>
      </div>
      {error && <div className="error-banner">{error}</div>}

      <div className="section-grid">
        <div className="card">
          <h3>Add new teacher</h3>
          <form onSubmit={add} className="teacher-form">
            <input placeholder="Full name" value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} />
            <input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
            <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
            <button type="submit">Add Teacher</button>
          </form>
        </div>

        <div className="card">
          <div className="list-header">
            <h3>Teacher directory</h3>
            <input className="search" placeholder="Search teachers" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {visibleTeachers.length === 0 ? (
            <div className="empty-state">No teachers found. Add a new teacher to begin managing records.</div>
          ) : (
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Phone</th><th>Email</th><th></th></tr>
              </thead>
              <tbody>
                {visibleTeachers.map(t => (
                  <tr key={t._id}>
                    <td>{t.fullName}</td>
                    <td>{t.phone || '—'}</td>
                    <td>{t.email || '—'}</td>
                    <td><button className="small-button" onClick={() => remove(t._id)}>Delete</button></td>
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
