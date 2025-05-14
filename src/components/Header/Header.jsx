import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import './Header.css';

export default function Header() {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = React.useState(false);
  const handleToggle = () => setNavOpen((open) => !open);
  const handleClose = () => setNavOpen(false);
  
  const handleLogoutClick = async () => {
    await handleLogout();
    handleClose();
    navigate('/login');
  }

  return (
    <header className="main-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">SC</span>
          <span className="logo-text">ServiCUCEI</span>
        </Link>
        
        <button className="menu-toggle" onClick={handleToggle} aria-label="Abrir menú">
          ☰
        </button>
        <nav className={`main-nav${navOpen ? ' open' : ''}`}>
          {user ? (
            <>
              <button className="close-menu" onClick={handleClose} aria-label="Cerrar menú">
                &times;
              </button>
              <div className="user-menu">
                <Link to="/dashboard" className="nav-link" onClick={handleClose}>Dashboard</Link>
                <Link to="/register-hours" className="nav-link" onClick={handleClose}>Registrar horas</Link>
                <Link to="/register-service" className="nav-link" onClick={handleClose}>Registrar servicio</Link>
                <button onClick={handleLogoutClick} className="logout-button">Cerrar sesión</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={handleClose}>Iniciar sesión</Link>
              <Link to="/register" className="nav-link" onClick={handleClose}>Registrarse</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}