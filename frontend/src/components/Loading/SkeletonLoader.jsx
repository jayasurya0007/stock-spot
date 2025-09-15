// SkeletonLoader.js
import React from 'react';
import './Loading.css';

const SkeletonLoader = ({ 
  type = 'text', 
  lines = 3, 
  width = '100%', 
  height = '20px',
  className = '',
  animated = true 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return (
          <div className="skeleton-text-container">
            {Array.from({ length: lines }).map((_, index) => (
              <div
                key={index}
                className={`skeleton-line ${animated ? 'animated' : ''}`}
                style={{
                  width: index === lines - 1 ? '75%' : width,
                  height
                }}
              />
            ))}
          </div>
        );
      
      case 'card':
        return (
          <div className={`skeleton-card ${animated ? 'animated' : ''}`}>
            <div className="skeleton-card-header" />
            <div className="skeleton-card-body">
              <div className="skeleton-line" style={{ width: '80%' }} />
              <div className="skeleton-line" style={{ width: '60%' }} />
              <div className="skeleton-line" style={{ width: '70%' }} />
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div className="skeleton-list">
            {Array.from({ length: lines || 5 }).map((_, index) => (
              <div key={index} className={`skeleton-list-item ${animated ? 'animated' : ''}`}>
                <div className="skeleton-avatar" />
                <div className="skeleton-list-content">
                  <div className="skeleton-line" style={{ width: '70%' }} />
                  <div className="skeleton-line" style={{ width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'table':
        return (
          <div className="skeleton-table">
            <div className="skeleton-table-header">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className={`skeleton-table-cell ${animated ? 'animated' : ''}`} />
              ))}
            </div>
            {Array.from({ length: lines || 5 }).map((_, rowIndex) => (
              <div key={rowIndex} className="skeleton-table-row">
                {Array.from({ length: 4 }).map((_, cellIndex) => (
                  <div key={cellIndex} className={`skeleton-table-cell ${animated ? 'animated' : ''}`} />
                ))}
              </div>
            ))}
          </div>
        );
      
      case 'avatar':
        return (
          <div 
            className={`skeleton-avatar ${animated ? 'animated' : ''}`} 
            style={{ width, height }}
          />
        );
      
      case 'button':
        return (
          <div 
            className={`skeleton-button ${animated ? 'animated' : ''}`} 
            style={{ width, height }}
          />
        );
      
      default:
        return (
          <div 
            className={`skeleton-line ${animated ? 'animated' : ''}`} 
            style={{ width, height }}
          />
        );
    }
  };

  return (
    <div className={`skeleton-loader ${className}`}>
      {renderSkeleton()}
    </div>
  );
};

export default SkeletonLoader;