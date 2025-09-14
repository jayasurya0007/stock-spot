import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import './PageLoader.css';

const PageLoader = ({ 
  message = 'Loading...', 
  submessage = '', 
  type = 'spinner', 
  progress = null,
  showLogo = true 
}) => {
  return (
    <div className="page-loader">
      <div className="page-loader-content">
        {showLogo && (
          <div className="page-loader-logo">
            <div className="logo-icon">📦</div>
            <h2>StockSpot</h2>
          </div>
        )}
        
        {type === 'spinner' && (
          <LoadingSpinner size="large" color="primary" />
        )}
        
        {type === 'dots' && (
          <div className="loading-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        )}
        
        {type === 'progress' && progress !== null && (
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <div className="progress-text">{Math.round(progress)}%</div>
          </div>
        )}
        
        <div className="page-loader-text">
          <h3>{message}</h3>
          {submessage && <p>{submessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default PageLoader;