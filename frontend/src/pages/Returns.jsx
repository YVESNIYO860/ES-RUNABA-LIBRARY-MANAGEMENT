import React, { useEffect, useState } from 'react'
import { get, post } from '../api'
import Loader from '../components/Loader'

export default function Returns(){
  const [borrows, setBorrows] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!loading) return
    setProgress(12)
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 7 + 3, 88))
    }, 220)
    return () => clearInterval(interval)
  }, [loading])

  async function load(){
    setLoading(true)
    setProgress(10)
    setMessage('Loading ES RUNABA borrow records...')
    try {
      const data = await get('/borrows')
      setBorrows(data)
    } catch (error) {
      console.error(error)
      setMessage('Failed to load ES RUNABA borrow records.')
    } finally {
      setProgress(100)
      setLoading(false)
    }
  }

  function pick(b){
    setSelected(b)
    setReturns(b.books.map(bb=> ({ bookId: bb.book._id, quantity: Math.max(0, bb.quantity - bb.returned) })))
  }

  function setQty(i, q){
    setReturns(returns.map((r,idx)=> idx===i? {...r, quantity: Number(q)}: r))
  }

  async function doReturn(){
    if (!selected) return
    setLoading(true)
    setProgress(8)
    setMessage('Saving ES RUNABA return...')
    try {
      const res = await post('/borrows/'+selected._id+'/return', { returns })
      if(res._id){
        alert('Return saved successfully.')
        load()
        setSelected(null)
      } else {
        alert(res.msg || 'Return failed.')
      }
    } catch (error) {
      console.error(error)
      setMessage('Failed to save ES RUNABA return.')
    } finally {
      setProgress(100)
      setLoading(false)
    }
  }

  const filteredBorrows = borrows.filter(b =>
    b.teacher?.fullName.toLowerCase().includes(search.toLowerCase()) ||
    b.books.some(bb => bb.book?.title?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      <Loader active={loading} title="ES RUNABA Library — Returns" message={message} progress={progress} />
      <div className="page-header">
        <div>
          <h2>Returns</h2>
          <p className="meta">Process returns and keep borrowed books up to date.</p>
        </div>
        <div className="action-note">Select a borrow record to return books and close the loan.</div>
      </div>

      <div className="cards">
        <div className="card">
          <h3>Borrow records</h3>
          <p className="large">{borrows.length}</p>
        </div>
        <div className="card">
          <h3>Selected items</h3>
          <p className="large">{selected ? selected.books.length : 0}</p>
        </div>
      </div>

      <div className="section-grid">
        <div className="card">
          <div className="list-header">
            <h3>Active borrow records</h3>
            <input className="search" placeholder="Search by teacher or title" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {filteredBorrows.length === 0 ? (
            <div className="empty-state">No borrow records match your search. Use the Borrow menu to create new loans.</div>
          ) : (
            <table className="table">
              <thead>
                <tr><th>Teacher</th><th>Date</th><th>Due</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {filteredBorrows.map(b => (
                  <tr key={b._id}>
                    <td>{b.teacher?.fullName}</td>
                    <td>{new Date(b.date).toLocaleDateString()}</td>
                    <td>{new Date(b.dueDate).toLocaleDateString()}</td>
                    <td><span className={`badge ${b.overdue ? 'badge-danger' : 'badge-success'}`}>{b.overdue ? 'Overdue' : 'On time'}</span></td>
                    <td><button className="small-button" onClick={() => pick(b)}>Select</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3>Return details</h3>
          {!selected ? (
            <div className="empty-state">Select a borrow record to review and return books.</div>
          ) : (
            <>
              <p><strong>{selected.teacher.fullName}</strong> · Due {new Date(selected.dueDate).toLocaleDateString()}</p>
              {selected.books.map((bb,idx) => (
                <div key={bb.book._id} className="cart-row">
                  <div>
                    <div className="return-book-title">{bb.title}</div>
                    <div className="return-book-note">Returned {bb.returned}/{bb.quantity}</div>
                  </div>
                  <input type="number" min="0" max={bb.quantity - bb.returned} value={returns[idx]?.quantity||0} onChange={e => setQty(idx,e.target.value)} />
                </div>
              ))}
              <button onClick={doReturn}>Submit Return</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
