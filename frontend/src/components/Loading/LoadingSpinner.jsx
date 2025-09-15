// LoadingSpinner.js
import React from 'react';
import './Loading.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = '', 
  centered = false,
  overlay = false,
  fullPage = false 
}) => {
  return (
    <div className={`loading-container ${centered ? 'centered' : ''} ${overlay ? 'overlay' : ''} ${fullPage ? 'full-page' : ''}`}>
      <div className="spinner-content">
        <div className={`spinner ${size} ${color}`}></div>
        {text && <p className="spinner-text">{text}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;