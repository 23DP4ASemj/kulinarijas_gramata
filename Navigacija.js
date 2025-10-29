// komponentes/Navigacija.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../util/auth';
import '../stili/navigacija.css';

const Navigacija = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  return (
    <nav className="navigacija">
      <div className="nav-container">
        <Link to="/receptes" className="nav-logo">
          🍳 Kulinārijas Grāmata
        </Link>

        <div className={`nav-links ${isMenuOpen ? 'nav-open' : ''}`}>
          <Link 
            to="/receptes" 
            className={location.pathname === '/receptes' ? 'active' : ''}
          >
            Receptes
          </Link>
          <Link 
            to="/kolekcijas" 
            className={location.pathname.startsWith('/kolekcijas') ? 'active' : ''}
          >
            Kolekcijas
          </Link>
          <Link 
            to="/pievienot" 
            className={location.pathname === '/pievienot' ? 'active' : ''}
          >
            Pievienot recepti
          </Link>
        </div>

        <div className="nav-profile">
          {currentUser ? (
            <div className="profile-dropdown">
              <Link 
                to="/profils" 
                className="profile-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <img 
                  src={currentUser.avatar || '/default-avatar.png'} 
                  alt={currentUser.name}
                  className="profile-avatar"
                />
                <span>{currentUser.name}</span>
              </Link>
            </div>
          ) : (
            <Link to="/profils" className="login-btn">
              Pieteikties
            </Link>
          )}
        </div>

        <button 
          className="nav-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navigacija;
