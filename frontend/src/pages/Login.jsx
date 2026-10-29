import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Shield, User, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from === '/login' ? '/' : from);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    setError(null);

    try {
      const user = await login(demoEmail, demoPassword);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="inner-hero" style={{ backgroundImage: 'url(/images/hero_3.jpg)', minHeight: '260px', height: '35vh' }}>
        <div className="hero-overlay"></div>
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <h1 style={{ color: '#ffffff', fontSize: '42px' }}>Sign In</h1>
          <ul className="breadcrumbs">
            <li><a href="/">Home</a></li>
            <li>&bull;</li>
            <li>Guest &amp; Staff Access</li>
          </ul>
        </div>
      </section>

      <section style={{ padding: '60px 0 100px', backgroundColor: 'var(--bg-light)' }}>
        <div className="container" style={{ maxWidth: '480px' }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '40px',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-color)'
            }}
          >
            <div className="text-center" style={{ marginBottom: '28px' }}>
              <span className="text-uppercase letter-spacing-2" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '12px' }}>
                Welcome Back
              </span>
              <h2 style={{ fontSize: '26px', marginTop: '6px' }}>Account Access</h2>
            </div>

            {/* Quick Demo Credentials Box */}
            <div
              style={{
                backgroundColor: 'var(--bg-light)',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
                border: '1px solid var(--border-color)'
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--dark)', display: 'block', marginBottom: '8px' }}>
                One-Click Quick Evaluation:
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('guest@hotelpro.com', 'guest123')}
                  className="btn btn-dark btn-sm"
                  style={{ fontSize: '11px', padding: '6px 14px' }}
                >
                  <User size={13} color="var(--primary)" /> Demo Guest
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@hotelpro.com', 'admin123')}
                  className="btn btn-dark btn-sm"
                  style={{ fontSize: '11px', padding: '6px 14px' }}
                >
                  <Shield size={13} color="var(--primary)" /> Hotel Admin
                </button>
              </div>
            </div>

            {error && (
              <div
                style={{
                  backgroundColor: 'var(--danger-bg)',
                  color: 'var(--danger)',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '20px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div className="text-center" style={{ marginTop: '24px', fontSize: '14px' }}>
              <span style={{ color: 'var(--body-muted)' }}>Don't have an account? </span>
              <Link to="/register" style={{ color: 'var(--primary-dark)', fontWeight: 'bold' }}>
                Register as Guest
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

