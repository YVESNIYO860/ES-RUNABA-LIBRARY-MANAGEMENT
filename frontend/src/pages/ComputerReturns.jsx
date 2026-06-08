import React, { useEffect, useState } from 'react'
import { get, post } from '../api'
import Loader from '../components/Loader'

export default function ComputerReturns() {
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

  async function load() {
    setLoading(true)
    setProgress(10)
    setMessage('Loading checkout records...')
    try {
      const data = await get('/computer-borrows')
      setBorrows(data)
    } catch (error) {
      console.error(error)
      setMessage('Failed to load borrow records.')
    } finally {
      setProgress(100)
      setLoading(false)
    }
  }

  function pick(b) {
    setSelected(b)
    setReturns(b.items.map(item => ({
      computerId: item.computer._id,
      quantity: Math.max(0, item.quantity - item.returned)
    })))
  }

  function setQty(i, q) {
    setReturns(returns.map((r, idx) => idx === i ? { ...r, quantity: Number(q) } : r))
  }

  async function doReturn() {
    if (!selected) return
    setLoading(true)
    setProgress(8)
    setMessage('Saving device return...')
    try {
      const res = await post('/computer-borrows/' + selected._id + '/return', { returns })
      if (res._id) {
        alert('Return logged successfully.')
        load()
        setSelected(null)
      } else {
        alert(res.msg || 'Return failed.')
      }
    } catch (error) {
      console.error(error)
      setMessage('Failed to log return.')
    } finally {
      setProgress(100)
      setLoading(false)
    }
  }

  const filteredBorrows = borrows.filter(b =>
    b.teacher?.fullName.toLowerCase().includes(search.toLowerCase()) ||
    b.items.some(item => item.computer?.name?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      <Loader active={loading} title="ES RUNABA Lab — Return" message={message} progress={progress} />
      <div className="page-header">
        <div>
          <h2>Returns & Check-in</h2>
          <p className="meta">Return checked-out computers and cables to the inventory.</p>
        </div>
      </div>

      <div className="cards">
        <div className="card">
          <h3>Active Checkouts</h3>
          <p className="large">{borrows.filter(x => x.status === 'borrowed').length}</p>
        </div>
        <div className="card">
          <h3>Total Records</h3>
          <p className="large">{borrows.length}</p>
        </div>
      </div>

      <div className="section-grid">
        <div className="card">
          <div className="list-header">
            <h3>Active Checkout Records</h3>
            <input className="search" placeholder="Search by teacher or item name" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {filteredBorrows.length === 0 ? (
            <div className="empty-state">No checkout records match your search.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBorrows.map(b => (
                  <tr key={b._id}>
                    <td>{b.teacher?.fullName}</td>
                    <td>{new Date(b.date).toLocaleDateString()}</td>
                    <td>{new Date(b.dueDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${b.overdue ? 'badge-danger' : 'badge-success'}`}>
                        {b.status === 'returned' ? 'Returned' : (b.overdue ? 'Overdue' : 'Active')}
                      </span>
                    </td>
                    <td>
                      {b.status !== 'returned' && (
                        <button className="small-button" onClick={() => pick(b)}>Select</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3>Return Details</h3>
          {!selected ? (
            <div className="empty-state">Select a checkout log from the list.</div>
          ) : (
            <>
              <p><strong>{selected.teacher.fullName}</strong> · Due {new Date(selected.dueDate).toLocaleDateString()}</p>
              {selected.items.map((item, idx) => (
                <div key={item.computer._id} className="cart-row">
                  <div>
                    <div className="return-book-title">{item.computer.name}</div>
                    <div className="return-book-note">
                      Tag: <code>{item.computer.serialNumber}</code> · Returned {item.returned}/{item.quantity}
                    </div>
                  </div>
                  <input type="number" min="0" max={item.quantity - item.returned} value={returns[idx]?.quantity || 0} onChange={e => setQty(idx, e.target.value)} />
                </div>
              ))}
              <button onClick={doReturn} style={{ width: '100%', marginTop: '16px' }}>Submit Return</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
