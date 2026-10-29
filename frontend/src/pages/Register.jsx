import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, AlertCircle } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register({ name, email, phone, password });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="inner-hero" style={{ backgroundImage: 'url(/images/hero_1.jpg)', minHeight: '260px', height: '35vh' }}>
        <div className="hero-overlay"></div>
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <h1 style={{ color: '#ffffff', fontSize: '42px' }}>Guest Registration</h1>
          <ul className="breadcrumbs">
            <li><a href="/">Home</a></li>
            <li>&bull;</li>
            <li>Create Profile</li>
          </ul>
        </div>
      </section>

      <section style={{ padding: '60px 0 100px', backgroundColor: 'var(--bg-light)' }}>
        <div className="container" style={{ maxWidth: '520px' }}>
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
                Join HotelPro Privileges
              </span>
              <h2 style={{ fontSize: '26px', marginTop: '6px' }}>Create Your Account</h2>
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
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="eleanor@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password (min. 6 characters)</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </form>

            <div className="text-center" style={{ marginTop: '24px', fontSize: '14px' }}>
              <span style={{ color: 'var(--body-muted)' }}>Already registered? </span>
              <Link to="/login" style={{ color: 'var(--primary-dark)', fontWeight: 'bold' }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

