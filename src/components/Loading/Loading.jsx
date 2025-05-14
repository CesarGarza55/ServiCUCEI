import React from 'react';
import './Loading.css';

export default function Loading({ fullScreen = false }) {
  return (
    <div className={`loading-container ${fullScreen ? 'full-screen' : ''}`}>
      <div className="loading-spinner">
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
      </div>
      <p>Cargando...</p>
    </div>
  );
}