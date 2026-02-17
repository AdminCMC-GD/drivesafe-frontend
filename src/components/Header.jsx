import React from 'react';
import '../styles/header.css';

export default function Header({ progress = 0, answeredCount = 0, total = 20, showProgress = true }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-logo">
          <img 
            src="/logo2.png" 
            alt="Consultores CMC" 
            className="logo-cmc"
          />
        </div>
        {showProgress && (
          <div className="header-progress-info">
            <span className="progress-counter">{answeredCount} de {total}</span>
          </div>
        )}
      </div>
      {showProgress && (
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      )}
    </header>
  );
}