import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import Alert from '../../components/Alert';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      const res = await adminApi.getDashboardStats();
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard statistics.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">System Administrator Dashboard</h1>
          <p className="page-subtitle">Real-time overview of users, stores, and ratings from MySQL database</p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={fetchStats} disabled={loading}>
          {loading ? 'Refreshing...' : '🔄 Refresh Data'}
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">👥</div>
          <div>
            <div className="stat-label">Registered Users</div>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">🏬</div>
          <div>
            <div className="stat-label">Total Stores</div>
            <div className="stat-value">{stats.totalStores}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">⭐</div>
          <div>
            <div className="stat-label">Submitted Ratings</div>
            <div className="stat-value">{stats.totalRatings}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>User Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
            View, search, filter, and create user accounts with ADMIN, USER, or STORE_OWNER roles.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/admin/users" className="btn btn-primary">
              Manage Users
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Store Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
            Register new stores, assign store owners, and monitor customer ratings and feedback.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/admin/stores" className="btn btn-primary">
              Manage Stores
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
