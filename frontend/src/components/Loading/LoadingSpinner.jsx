import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = '', 
  centered = false,
  overlay = false,
  fullPage = false 
}) => {
  const sizeClasses = {
    small: 'spinner-sm',
    medium: 'spinner-md',
    large: 'spinner-lg'
  };

  const colorClasses = {
    primary: 'spinner-primary',
    secondary: 'spinner-secondary',
    white: 'spinner-white',
    dark: 'spinner-dark'
  };

  const spinnerClasses = [
    'loading-spinner',
    sizeClasses[size] || sizeClasses.medium,
    colorClasses[color] || colorClasses.primary
  ].join(' ');

  const containerClasses = [
    'spinner-container',
    centered && 'spinner-centered',
    overlay && 'spinner-overlay',
    fullPage && 'spinner-fullpage'
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className="spinner-content">
        <div className={spinnerClasses}></div>
        {text && <p className="spinner-text">{text}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;