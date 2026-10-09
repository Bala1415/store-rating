import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (trimmedName.length < 20 || trimmedName.length > 60) {
      setError(`Name must be between 20 and 60 characters. Current length: ${trimmedName.length}.`);
      return;
    }

    if (password.length < 8 || password.length > 16) {
      setError('Password must be between 8 and 16 characters.');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter.');
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setError('Password must contain at least one special character (!@#$%^&* etc).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    if (address && address.trim().length > 400) {
      setError('Address cannot exceed 400 characters.');
      return;
    }

    try {
      setLoading(true);
      await signup({
        name: trimmedName,
        email: email.trim().toLowerCase(),
        password,
        address: address ? address.trim() : null,
      });
      navigate('/stores', { replace: true });
    } catch (err) {
      setError(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Sign up as a Normal User to discover and rate stores</p>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Full Name</label>
              <span style={{ fontSize: '0.75rem', color: name.trim().length < 20 || name.trim().length > 60 ? '#dc2626' : '#16a34a' }}>
                {name.trim().length}/60 chars (min 20)
              </span>
            </div>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Customer Jonathan Abernathy"
              required
              minLength={20}
              maxLength={60}
            />
            <div className="form-hint">Must be 20 to 60 characters per challenge requirement.</div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address (Optional)</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, City, Postal Code (max 400 characters)"
              maxLength={400}
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
              minLength={8}
              maxLength={16}
              autoComplete="new-password"
            />
            <div className="form-hint">8–16 chars, 1 uppercase letter, 1 special character.</div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              maxLength={16}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Registering Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
