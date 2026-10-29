import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, Shield, CalendarCheck } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navClass = !isHomePage || scrolled ? 'site-header scrolled' : 'site-header';

  return (
    <header className={navClass}>
      <div className="container">
        <div className="header-container">
          <Link to="/" className="site-logo">
            Hotel<span>Pro</span>
          </Link>

          <ul className={`nav-links ${mobileOpen ? 'open' : ''}`}>
            <li>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/rooms" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Rooms
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                About
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Contact
              </NavLink>
            </li>

            {isAuthenticated && !isAdmin && (
              <li>
                <NavLink to="/my-bookings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  My Bookings
                </NavLink>
              </li>
            )}

            {isAdmin && (
              <li>
                <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <Shield size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Admin
                </NavLink>
              </li>
            )}
          </ul>

          <div className="header-actions">
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: !isHomePage || scrolled ? 'var(--dark)' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <User size={15} color="var(--primary)" />
                  {user?.name?.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-white btn-sm"
                  style={{
                    borderColor: !isHomePage || scrolled ? 'var(--dark)' : '#ffffff',
                    color: !isHomePage || scrolled ? 'var(--dark)' : '#ffffff'
                  }}
                  title="Sign Out"
                >
                  <LogOut size={13} />
                  <span>Exit</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link
                  to="/login"
                  className="btn btn-outline-white btn-sm"
                  style={{
                    borderColor: !isHomePage || scrolled ? 'var(--dark)' : '#ffffff',
                    color: !isHomePage || scrolled ? 'var(--dark)' : '#ffffff'
                  }}
                >
                  Sign In
                </Link>
                <Link to="/rooms" className="btn btn-primary btn-sm">
                  Book Now
                </Link>
              </div>
            )}

            <button
              className="mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

