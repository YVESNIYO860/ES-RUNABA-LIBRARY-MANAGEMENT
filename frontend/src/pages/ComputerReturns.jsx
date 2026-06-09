import React, { useEffect, useState } from 'react'
import { get, post } from '../api'
import Loader from '../components/Loader'

export default function ComputerReturns() {
  const [borrows,  setBorrows]  = useState([])
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('active') // 'active' | 'all'
  const [selected, setSelected] = useState(null)
  const [returns,  setReturns]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const [message,  setMessage]  = useState('')
  const [progress, setProgress] = useState(0)

  useEffect(() => { load() }, [])
  useEffect(() => {
    if (!loading) return
    setProgress(12)
    const interval = setInterval(() => setProgress(p => Math.min(p + Math.random() * 7 + 3, 88)), 220)
    return () => clearInterval(interval)
  }, [loading])

  async function load() {
    setLoading(true); setProgress(10); setMessage('Loading checkout records...')
    try {
      const data = await get('/computer-borrows')
      setBorrows(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    finally { setProgress(100); setLoading(false) }
  }

  function pick(b) {
    setSelected(b)
    setReturns(b.items.map(item => ({
      computerId: item.computer._id,
      quantity: Math.max(0, item.quantity - item.returned)   // pre-fill remaining qty
    })))
  }

  function setQty(i, q) {
    const max = selected.items[i].quantity - selected.items[i].returned
    setReturns(returns.map((r, idx) => idx === i ? { ...r, quantity: Math.min(Number(q), max) } : r))
  }

  function markAllReturned() {
    setReturns(selected.items.map(item => ({
      computerId: item.computer._id,
      quantity: item.quantity - item.returned
    })))
  }

  async function doReturn() {
    if (!selected) return
    const totalQty = returns.reduce((s, r) => s + r.quantity, 0)
    if (totalQty === 0) return alert('Enter at least 1 item to return.')
    setLoading(true); setProgress(8); setMessage('Saving return...')
    try {
      const res = await post('/computer-borrows/' + selected._id + '/return', { returns })
      if (res._id) {
        alert('Return logged successfully! ✅')
        load(); setSelected(null)
      } else alert(res.msg || 'Return failed.')
    } catch (e) { console.error(e) }
    finally { setProgress(100); setLoading(false) }
  }

  const displayed = borrows.filter(b => {
    const matchFilter = filter === 'all' || b.status !== 'returned'
    const q = search.toLowerCase()
    const matchSearch = !q ||
      b.teacher?.fullName.toLowerCase().includes(q) ||
      b.items.some(i => i.computer?.name?.toLowerCase().includes(q))
    return matchFilter && matchSearch
  })

  const activeCount   = borrows.filter(b => b.status !== 'returned').length
  const returnedCount = borrows.filter(b => b.status === 'returned').length
  const overdueCount  = borrows.filter(b => b.overdue).length

  return (
    <div>
      <Loader active={loading} title="ES RUNABA Lab — Returns" message={message} progress={progress} />

      <div className="page-header">
        <div>
          <h2 style={{ margin: 0 }}>Returns & Check-in</h2>
          <p className="meta">Process returns and restore devices to available inventory.</p>
        </div>
      </div>

      {/* Summary stat row */}
      <div className="cards" style={{ marginBottom: '20px' }}>
        <div className="card" style={{ borderTop: '4px solid #f57c00' }}>
          <div style={{ color: '#4d5e77', fontSize: '0.85rem' }}>Active Checkouts</div>
          <div className="large" style={{ color: '#f57c00' }}>{activeCount}</div>
        </div>
        <div className="card" style={{ borderTop: '4px solid #c62828' }}>
          <div style={{ color: '#4d5e77', fontSize: '0.85rem' }}>Overdue</div>
          <div className="large" style={{ color: '#c62828' }}>{overdueCount}</div>
        </div>
        <div className="card" style={{ borderTop: '4px solid #2e7d32' }}>
          <div style={{ color: '#4d5e77', fontSize: '0.85rem' }}>Fully Returned</div>
          <div className="large" style={{ color: '#2e7d32' }}>{returnedCount}</div>
        </div>
        <div className="card" style={{ borderTop: '4px solid #0b5394' }}>
          <div style={{ color: '#4d5e77', fontSize: '0.85rem' }}>Total Sessions</div>
          <div className="large">{borrows.length}</div>
        </div>
      </div>

      <div className="section-grid">

        {/* Left: checkout list */}
        <div className="card">
          <div className="list-header">
            <h3 style={{ margin: 0 }}>Checkout Records</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input className="search" style={{ margin: 0, flex: 1 }}
                placeholder="Search teacher or device name"
                value={search} onChange={e => setSearch(e.target.value)} />
              <select value={filter} onChange={e => setFilter(e.target.value)}
                style={{ width: 'auto', margin: 0, padding: '10px 12px' }}>
                <option value="active">Active only</option>
                <option value="all">All records</option>
              </select>
            </div>
          </div>

          {displayed.length === 0 ? (
            <div className="empty-state">No records match your search.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Items</th>
                  <th>Checkout Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map(b => {
                  const totalQty    = b.items.reduce((s, i) => s + i.quantity, 0)
                  const returnedQty = b.items.reduce((s, i) => s + i.returned, 0)
                  const allBack     = b.status === 'returned'
                  const isOverdue   = b.overdue && !allBack

                  return (
                    <tr key={b._id} style={{
                      background: selected?._id === b._id ? 'rgba(11,83,148,.06)' : undefined
                    }}>
                      <td><strong>{b.teacher?.fullName || '—'}</strong></td>
                      <td>
                        <span title={`${returnedQty} of ${totalQty} returned`}>
                          {returnedQty}/{totalQty}
                          {' '}
                          {/* mini progress bar */}
                          <span style={{
                            display: 'inline-block', width: 48, height: 6,
                            borderRadius: 999, background: '#eee', verticalAlign: 'middle', marginLeft: 4
                          }}>
                            <span style={{
                              display: 'block',
                              width: `${totalQty > 0 ? Math.round((returnedQty / totalQty) * 100) : 0}%`,
                              height: '100%', borderRadius: 999,
                              background: allBack ? '#2e7d32' : '#0b5394'
                            }} />
                          </span>
                        </span>
                      </td>
                      <td>{new Date(b.date).toLocaleDateString()}</td>
                      <td>{new Date(b.dueDate).toLocaleDateString()}</td>
                      <td>
                        <span className="badge" style={{
                          background: allBack ? 'rgba(46,125,50,.12)' : isOverdue ? 'rgba(198,40,40,.12)' : 'rgba(11,83,148,.10)',
                          color: allBack ? '#2e7d32' : isOverdue ? '#c62828' : '#0b5394'
                        }}>
                          {allBack ? '✔ Returned' : isOverdue ? '⚠ Overdue' : '⏳ Active'}
                        </span>
                      </td>
                      <td>
                        {!allBack && (
                          <button className="small-button" onClick={() => pick(b)}>
                            Return
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Right: return form */}
        <div className="card">
          <h3 style={{ marginTop: 0 }}>
            {selected ? `Return items for ${selected.teacher?.fullName}` : 'Return Details'}
          </h3>

          {!selected ? (
            <div className="empty-state">Click <strong>Return</strong> next to a checkout record to process it.</div>
          ) : (
            <>
              <div style={{ marginBottom: '12px', color: '#4d5e77', fontSize: '0.9rem' }}>
                Due: <strong>{new Date(selected.dueDate).toLocaleDateString()}</strong>
                {selected.overdue && <span className="badge badge-danger" style={{ marginLeft: 8 }}>⚠ Overdue</span>}
              </div>

              {/* Per-item return rows */}
              {selected.items.map((item, idx) => {
                const remaining  = item.quantity - item.returned
                const fullyDone  = remaining === 0
                const returnQty  = returns[idx]?.quantity ?? 0

                return (
                  <div key={item.computer._id} style={{
                    border: '1px solid #e8edf5', borderRadius: '10px',
                    padding: '12px', marginBottom: '10px',
                    background: fullyDone ? 'rgba(46,125,50,.05)' : 'white'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {item.computer.type === 'computer' ? '🖥' : '🔌'} {item.computer.name}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#6b7b96', marginTop: '2px' }}>
                          Tag: <code>{item.computer.serialNumber}</code>
                        </div>
                        <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                          <span style={{ color: '#2e7d32' }}>✔ {item.returned} returned</span>
                          {' · '}
                          <span style={{ color: fullyDone ? '#2e7d32' : '#e65100' }}>
                            {fullyDone ? 'All back ✅' : `${remaining} still out`}
                          </span>
                        </div>
                      </div>

                      {/* Return quantity */}
                      {!fullyDone && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '80px' }}>
                          <label style={{ fontSize: '0.78rem', color: '#4d5e77' }}>Return qty</label>
                          <input type="number" min="0" max={remaining}
                            value={returnQty}
                            onChange={e => setQty(idx, e.target.value)}
                            style={{ width: '60px', textAlign: 'center', margin: 0 }} />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button onClick={markAllReturned} style={{ flex: 1, background: '#f0f4ff', color: '#0b5394', border: '1px solid #c8d8f8' }}>
                  Mark All Returned
                </button>
                <button onClick={doReturn} style={{ flex: 1 }}>
                  ✔ Submit Return
                </button>
              </div>
              <button onClick={() => setSelected(null)}
                style={{ width: '100%', marginTop: '8px', background: '#f5f7fb', color: '#4d5e77', border: '1px solid #ddd' }}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
