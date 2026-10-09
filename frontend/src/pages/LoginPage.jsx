import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      const user = await login({ email, password });

      // Direct user according to their role or requested redirect
      const from = location.state?.from?.pathname;
      if (from && from !== '/login') {
        navigate(from, { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'STORE_OWNER') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        navigate('/stores', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  // Quick helper to pre-fill test demo accounts
  function fillDemo(e, demoEmail, demoPass) {
    e.preventDefault();
    setEmail(demoEmail);
    setPassword(demoPass);
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your Store Rating account</p>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@roxiler.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '20px', padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Demo Quick-Login:</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={(e) => fillDemo(e, 'admin@roxiler.com', 'Admin@1234')}
            >
              Admin
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={(e) => fillDemo(e, 'alice.owner@roxiler.com', 'Owner@1234')}
            >
              Store Owner
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={(e) => fillDemo(e, 'chris.user@gmail.com', 'User@1234')}
            >
              Normal User
            </button>
          </div>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Create Normal User Account</Link>
        </div>
      </div>
    </div>
  );
}
