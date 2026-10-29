import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, BedDouble, CalendarDays, Users, ExternalLink, LogOut, Shield } from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/admin" className="site-logo" style={{ fontSize: '24px' }}>
            Hotel<span>Pro</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <Shield size={14} color="var(--primary)" />
            <span style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
              Hotel Administration
            </span>
          </div>
        </div>

        <ul className="admin-nav">
          <li className="admin-nav-item">
            <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'active' : '')}>
              <LayoutDashboard size={18} />
              <span>Dashboard &amp; Metrics</span>
            </NavLink>
          </li>
          <li className="admin-nav-item">
            <NavLink to="/admin/rooms" className={({ isActive }) => (isActive ? 'active' : '')}>
              <BedDouble size={18} />
              <span>Room Listings</span>
            </NavLink>
          </li>
          <li className="admin-nav-item">
            <NavLink to="/admin/reservations" className={({ isActive }) => (isActive ? 'active' : '')}>
              <CalendarDays size={18} />
              <span>Reservations</span>
            </NavLink>
          </li>
          <li className="admin-nav-item">
            <NavLink to="/admin/guests" className={({ isActive }) => (isActive ? 'active' : '')}>
              <Users size={18} />
              <span>Guest Directory</span>
            </NavLink>
          </li>
        </ul>

        <div style={{ padding: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ marginBottom: '14px', fontSize: '13px' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Signed in as:</span>
            <strong style={{ color: '#ffffff' }}>{user?.name || 'Administrator'}</strong>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              to="/"
              className="btn btn-outline-white btn-sm"
              style={{ flex: 1, fontSize: '11px', padding: '6px 10px' }}
              title="Return to Public Website"
            >
              <ExternalLink size={12} />
              <span>Public</span>
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-dark btn-sm"
              style={{ flex: 1, fontSize: '11px', padding: '6px 10px', backgroundColor: '#333' }}
              title="Log out"
            >
              <LogOut size={12} />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

