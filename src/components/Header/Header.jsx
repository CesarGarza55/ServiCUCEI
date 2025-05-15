import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import './Header.css';

export default function Header() {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = React.useState(false);
  const handleToggle = () => setNavOpen((open) => !open);
  const handleClose = () => setNavOpen(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
  
  const handleLogoutClick = async () => {
    await handleLogout();
    handleClose();
    navigate('/login');
  }

  // Manejar el evento `beforeinstallprompt`
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e); // Guarda el evento para usarlo más tarde
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt(); // Muestra el prompt de instalación
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('PWA instalada');
        } else {
          console.log('PWA no instalada');
        }
        setDeferredPrompt(null); // Limpia el evento después de usarlo
      });
    }
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">SC</span>
          <span className="logo-text">ServiCUCEI</span>
        </Link>
        
        <nav className={`main-nav${navOpen ? ' open' : ''}`}>
        <button className="menu-toggle" onClick={handleToggle} aria-label="Abrir menú">
          ☰
        </button>
          {user ? (
            <>
              <button className="close-menu" onClick={handleClose} aria-label="Cerrar menú">
                &times;
              </button>
              <div className="user-menu">
                <Link to="/dashboard" className="nav-link" onClick={handleClose}>Dashboard</Link>
                <Link to="/register-hours" className="nav-link" onClick={handleClose}>Registrar horas</Link>
                <Link to="/register-service" className="nav-link" onClick={handleClose}>Registrar servicio</Link>
                {deferredPrompt && (
                  <button onClick={handleInstallClick} className="install-button">
                    Instalar app
                  </button>
                )}
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