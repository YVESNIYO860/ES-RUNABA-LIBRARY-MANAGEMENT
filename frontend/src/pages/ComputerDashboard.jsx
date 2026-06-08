import React, { useEffect, useState } from 'react'
import { get } from '../api'
import Loader from '../components/Loader'

export default function ComputerDashboard() {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setMessage('Loading ES RUNABA computer lab dashboard...')
      try {
        const items = await get('/computers')
        const teachers = await get('/teachers')
        const borrows = await get('/computer-borrows')
        
        const totalItems = Array.isArray(items) ? items.reduce((s, b) => s + b.total, 0) : 0
        const available = Array.isArray(items) ? items.reduce((s, b) => s + b.available, 0) : 0
        
        const typeBreakdown = Array.isArray(items)
          ? items.reduce((acc, item) => {
              const key = item.type === 'computer' ? 'Computers' : 'Cables'
              acc[key] = (acc[key] || 0) + item.total
              return acc
            }, { Computers: 0, Cables: 0 })
          : { Computers: 0, Cables: 0 }
          
        const borrowedItems = Array.isArray(borrows)
          ? borrows.reduce((s, b) => s + b.items.reduce((ss, bb) => ss + (bb.quantity - bb.returned), 0), 0)
          : 0

        const overdue = Array.isArray(borrows) ? borrows.filter(x => x.overdue).length : 0

        setStats({
          totalItems,
          available,
          totalTeachers: Array.isArray(teachers) ? teachers.length : 0,
          borrowedItems,
          overdue,
          typeBreakdown
        })
      } catch (error) {
        console.error(error)
        setMessage('Failed to load dashboard.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      <Loader active={loading} title="ES RUNABA Lab — Dashboard" message={message} />
      <div className="page-header">
        <div>
          <h2>Computer Lab Dashboard</h2>
          <div className="meta">Overview of devices, cables, and daily checkout logs</div>
        </div>
      </div>
      <div className="cards">
        <div className="card">
          Total Devices: <strong className="large">{stats.totalItems || 0}</strong>
        </div>
        <div className="card">
          Available: <strong className="large">{stats.available || 0}</strong>
        </div>
        <div className="card">
          Borrowed items: <strong className="large">{stats.borrowedItems || 0}</strong>
        </div>
        <div className="card">
          Teachers: <strong className="large">{stats.totalTeachers || 0}</strong>
        </div>
        <div className="card">
          Overdue txns: <strong className="large">{stats.overdue || 0}</strong>
        </div>
      </div>
      
      <div className="card">
        <h3>Inventory breakdown</h3>
        <div style={{ marginTop: '14px' }}>
          <p>🖥 <strong>Computers:</strong> {stats.typeBreakdown?.Computers || 0} total</p>
          <p>🔌 <strong>Cables & Accessories:</strong> {stats.typeBreakdown?.Cables || 0} total</p>
        </div>
      </div>
    </div>
  )
}
