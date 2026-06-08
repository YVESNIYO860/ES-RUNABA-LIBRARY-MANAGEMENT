import React from 'react'

export default function Loader({ active, title = 'ES RUNABA Library', message, progress, current, total }) {
  if (!active) return null
  return (
    <div className="loader-overlay">
      <div className="loader-card">
        <div className="loader-spinner"></div>
        <div className="loader-message">
          <strong>{title}</strong>
          <p>{message || 'Loading ES RUNABA Library...'}</p>
          {typeof progress === 'number' && (
            <div className="loader-progress">
              <div className="loader-progress-bar" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
          )}
          {typeof current === 'number' && typeof total === 'number' && total > 0 && (
            <small>{current} / {total} items loaded</small>
          )}
        </div>
      </div>
    </div>
  )
}
