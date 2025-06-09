import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">🛍️</span>
            ShopBot
          </Link>

          <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            <div className="navbar-nav">
              <Link
                to="/"
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className={`nav-link ${isActive('/products') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Products
              </Link>
              {user && (
                <Link
                  to="/chat"
                  className={`nav-link ${isActive('/chat') ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="chat-icon">💬</span>
                  Chat
                </Link>
              )}
            </div>

            <div className="navbar-actions">
              {user ? (
                <div className="user-menu">
                  <Link
                    to="/profile"
                    className={`nav-link user-link ${isActive('/profile') ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="user-avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                    {user.username}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary btn-sm logout-btn"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="auth-links">
                  <Link
                    to="/login"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>

          <button
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
