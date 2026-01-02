import React from 'react'
import './ProgressBar.css'

const ProgressBar = ({ progress, current, total, message }) => {
  return (
    <div className="progress-overlay">
      <div className="progress-container">
        <h3>📊 {message || 'Importando Trades'}</h3>
        <div className="progress-bar-wrapper">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progress}%` }}
          >
            <span className="progress-text">{progress}%</span>
          </div>
        </div>
        <p className="progress-info">
          {current} de {total} trades importados
        </p>
      </div>
    </div>
  )
}

export default ProgressBar

