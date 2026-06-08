import React, { useEffect, useState } from 'react'
import { get, post, del } from '../api'
import Loader from '../components/Loader'

export default function Books(){
  const [list, setList] = useState([])
  const [form, setForm] = useState({title:'', author:'', category:'General', total:1, bookId:''})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(0)

  useEffect(()=>{ load() }, [])
  useEffect(() => {
    if (!loading) return
    setProgress(12)
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 8 + 4, 92))
    }, 200)
    return () => clearInterval(interval)
  }, [loading])

  async function load(){
    setLoading(true)
    setProgress(10)
    setMessage('Loading ES RUNABA book list...')
    try {
      const data = await get('/books')
      setList(data)
    } catch (error) {
      console.error(error)
      setMessage('Failed to load ES RUNABA book list.')
    } finally {
      setProgress(100)
      setLoading(false)
    }
  }

  async function add(e){
    e.preventDefault()
    setLoading(true)
    setProgress(8)
    setMessage('Saving new ES RUNABA book...')
    try {
      await post('/books', form)
      setForm({title:'',author:'',category:'General',total:1,bookId:''})
      await load()
    } catch (error) {
      console.error(error)
      setMessage('Failed to save new ES RUNABA book.')
    } finally {
      setProgress(100)
      setLoading(false)
    }
  }

  async function remove(id){
    if(confirm('Delete?')){
      setLoading(true)
      setMessage('Removing book...')
      try {
        await del('/books/'+id)
        await load()
      } catch (error) {
        console.error(error)
        setMessage('Failed to remove ES RUNABA book.')
      } finally {
        setProgress(100)
        setLoading(false)
      }
    }
  }

  return (
    <div>
      <Loader active={loading} title="ES RUNABA Library — Books" message={message} progress={progress} />
      <h2>Books</h2>
      <p className="meta">Catalog contains {list.length} book{list.length === 1 ? '' : 's'}.</p>
      <form onSubmit={add} className="card small">
        <input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
        <input placeholder="Author" value={form.author} onChange={e=>setForm({...form,author:e.target.value})} />
        <input placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} />
        <input placeholder="Total" type="number" value={form.total} onChange={e=>setForm({...form,total:e.target.value})} />
        <input placeholder="Book ID" value={form.bookId} onChange={e=>setForm({...form,bookId:e.target.value})} />
        <button type="submit">Add</button>
      </form>

      <table className="table">
        <thead><tr><th>Title</th><th>Author</th><th>Category</th><th>Total</th><th>Available</th><th>Book ID</th><th></th></tr></thead>
        <tbody>
          {list.map(b=> <tr key={b._id}><td>{b.title}</td><td>{b.author}</td><td>{b.category || 'General'}</td><td>{b.total}</td><td>{b.available}</td><td>{b.bookId}</td><td><button onClick={()=>remove(b._id)}>Delete</button></td></tr>)}
        </tbody>
      </table>
    </div>
  )
}
