import React, { useEffect, useState } from 'react'
import { get } from '../api'
import Loader from '../components/Loader'

export default function ComputerDashboard() {
  const [stats, setStats]   = useState({})
  const [recentBorrows, setRecentBorrows] = useState([])
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setMessage('Loading Computer Lab dashboard...')
    try {
      const [items, teachers, borrows] = await Promise.all([
        get('/computers'),
        get('/teachers'),
        get('/computer-borrows')
      ])

      const totalItems    = Array.isArray(items) ? items.reduce((s, b) => s + b.total, 0) : 0
      const available     = Array.isArray(items) ? items.reduce((s, b) => s + b.available, 0) : 0
      const checkedOut    = totalItems - available

      const computers = Array.isArray(items) ? items.filter(x => x.type === 'computer') : []
      const cables    = Array.isArray(items) ? items.filter(x => x.type === 'cable')    : []

      const activeBorrows  = Array.isArray(borrows) ? borrows.filter(b => b.status !== 'returned') : []
      const returnedBorrows = Array.isArray(borrows) ? borrows.filter(b => b.status === 'returned') : []
      const overdue        = Array.isArray(borrows) ? borrows.filter(x => x.overdue) : []

      setStats({
        totalItems,
        available,
        checkedOut,
        totalComputers: computers.reduce((s, c) => s + c.total, 0),
        totalCables:    cables.reduce((s, c) => s + c.total, 0),
        totalTeachers:  Array.isArray(teachers) ? teachers.length : 0,
        activeSessions: activeBorrows.length,
        returnedSessions: returnedBorrows.length,
        overdueSessions: overdue.length,
        totalSessions: Array.isArray(borrows) ? borrows.length : 0,
      })

      // Last 5 borrow sessions
      setRecentBorrows(Array.isArray(borrows) ? borrows.slice(0, 5) : [])
      setInventory(Array.isArray(items) ? items : [])
    } catch (err) {
      console.error(err)
      setMessage('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  const statCard = (icon, label, value, color = '#0b5394') => (
    <div className="card" style={{ flex: '1', minWidth: '140px', borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: '1.6rem', marginBottom: '4px' }}>{icon}</div>
      <div style={{ color: '#4d5e77', fontSize: '0.85rem', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color }}>{value}</div>
    </div>
  )

  return (
    <div>
      <Loader active={loading} title="ES RUNABA Lab — Dashboard" message={message} />

      {/* Header */}
      <div className="page-header">
        <div>
          <h2 style={{ margin: 0 }}>🖥 Computer Lab Dashboard</h2>
          <div className="meta">Real-time overview of lab inventory, checkouts, and teacher activity</div>
        </div>
        <button onClick={load} style={{ background: '#f0f4ff', color: '#0b5394', border: '1px solid #c8d8f8', padding: '8px 16px' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Overdue Alert */}
      {stats.overdueSessions > 0 && (
        <div className="error-banner" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.4rem' }}>⚠️</span>
          <div>
            <strong>{stats.overdueSessions} overdue session{stats.overdueSessions > 1 ? 's' : ''}</strong>
            {' '}— devices have not been returned past their due date. Go to <em>Return</em> to process them.
          </div>
        </div>
      )}

      {/* Stat cards row 1 */}
      <div className="cards" style={{ marginBottom: '4px' }}>
        {statCard('📦', 'Total Inventory',  stats.totalItems    || 0, '#0b5394')}
        {statCard('✅', 'Available',        stats.available     || 0, '#2e7d32')}
        {statCard('🔄', 'Checked Out',      stats.checkedOut    || 0, '#e65100')}
        {statCard('👩‍🏫', 'Teachers',        stats.totalTeachers || 0, '#6a1b9a')}
      </div>

      {/* Stat cards row 2 */}
      <div className="cards" style={{ marginBottom: '20px' }}>
        {statCard('🖥',  'Computers',        stats.totalComputers  || 0, '#1565c0')}
        {statCard('🔌',  'Cables',           stats.totalCables     || 0, '#4e342e')}
        {statCard('📋',  'Active Sessions',  stats.activeSessions  || 0, '#f57c00')}
        {statCard('✔️',  'Returned Sessions',stats.returnedSessions|| 0, '#2e7d32')}
        {statCard('🚨',  'Overdue',          stats.overdueSessions || 0, '#c62828')}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '18px' }}>

        {/* Recent Checkout Sessions */}
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Recent Checkout Sessions</h3>
          {recentBorrows.length === 0 ? (
            <div className="empty-state">No checkout sessions recorded yet.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Items</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBorrows.map(b => {
                  const totalQty = b.items.reduce((s, i) => s + i.quantity, 0)
                  const returnedQty = b.items.reduce((s, i) => s + i.returned, 0)
                  const statusLabel = b.status === 'returned' ? 'Returned' : b.overdue ? 'Overdue' : 'Active'
                  const statusClass = b.status === 'returned' ? 'badge-success' : b.overdue ? 'badge-danger' : 'badge'
                  return (
                    <tr key={b._id}>
                      <td><strong>{b.teacher?.fullName || '—'}</strong></td>
                      <td>{returnedQty}/{totalQty} returned</td>
                      <td>{new Date(b.date).toLocaleDateString()}</td>
                      <td>{new Date(b.dueDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${statusClass}`} style={{
                          background: b.status === 'returned' ? 'rgba(46,125,50,.12)' : b.overdue ? 'rgba(198,40,40,.12)' : 'rgba(11,83,148,.12)',
                          color: b.status === 'returned' ? '#2e7d32' : b.overdue ? '#c62828' : '#0b5394'
                        }}>
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Inventory Summary */}
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Inventory Status</h3>
          {inventory.length === 0 ? (
            <div className="empty-state">No devices in catalog yet.</div>
          ) : (
            <div>
              {inventory.map(item => {
                const pct = item.total > 0 ? Math.round((item.available / item.total) * 100) : 0
                const barColor = pct > 60 ? '#2e7d32' : pct > 30 ? '#f57c00' : '#c62828'
                return (
                  <div key={item._id} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {item.type === 'computer' ? '🖥' : '🔌'} {item.name}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#4d5e77' }}>
                        {item.available}/{item.total}
                      </span>
                    </div>
                    <div style={{ background: '#f0f4ff', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: '999px', transition: 'width .4s ease' }} />
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7b96', marginTop: '2px' }}>
                      {item.available === 0 ? '⚠ Out of stock' : `${pct}% available`}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
