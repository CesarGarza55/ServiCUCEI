import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>Servicio Social CUCEI</h4>
          <p>Sistema de gestión para el servicio social de los estudiantes</p>
        </div>
        <div className="footer-section">
          <h4>Contacto</h4>
          <p>serviciosocial@cucei.udg.mx</p>
          <p>+52 33 1234 5678</p>
        </div>
        <div className="footer-section">
          <h4>Enlaces</h4>
          <a href="/">Inicio</a>
          <a href="/login">Acceso</a>
          <a href="/dashboard">Dashboard</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} CUCEI - Todos los derechos reservados</p>
      </div>
    </footer>
  );
}