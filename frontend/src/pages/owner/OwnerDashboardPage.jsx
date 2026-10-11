import React, { useState, useEffect } from 'react';
import { ownerApi } from '../../services/api';
import Alert from '../../components/Alert';
import StarRating from '../../components/StarRating';

export default function OwnerDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('DESC');

  useEffect(() => {
    fetchOwnerDashboard();
  }, [sortBy, sortOrder]);

  async function fetchOwnerDashboard() {
    try {
      setLoading(true);
      const res = await ownerApi.getDashboard({ sortBy, sortOrder });
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load store owner dashboard.');
    } finally {
      setLoading(false);
    }
  }

  function handleSort(columnKey) {
    if (sortBy === columnKey) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(columnKey);
      setSortOrder('ASC');
    }
  }

  function renderSortIndicator(columnKey) {
    if (sortBy !== columnKey) return <span className="sort-indicator">↕</span>;
    return <span className="sort-indicator active">{sortOrder === 'ASC' ? '▲' : '▼'}</span>;
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
        Loading store dashboard...
      </div>
    );
  }

  if (!data?.hasStore || !data?.store) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Store Owner Dashboard</h1>
            <p className="page-subtitle">Manage and monitor customer ratings for your business</p>
          </div>
        </div>

        <div className="empty-state" style={{ maxWidth: '580px', margin: '40px auto' }}>
          <div className="empty-state-icon">🏬</div>
          <h2 className="empty-state-title">No Store Associated Yet</h2>
          <p className="empty-state-text" style={{ marginBottom: '16px' }}>
            {data?.message || 'Your account is recognized as a Store Owner, but no store profile has been linked to your account by an administrator yet.'}
          </p>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Please contact a System Administrator to register and link your store to this account.
          </div>
        </div>
      </div>
    );
  }

  const { store, average_rating, total_ratings, ratings } = data;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Store Owner Dashboard</h1>
          <p className="page-subtitle">Real-time performance and customer ratings for your store</p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={fetchOwnerDashboard}>
          🔄 Refresh
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Store Profile Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: '#0f172a', marginBottom: '4px' }}>{store.name}</h2>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>📍 {store.address || 'Address not listed'}</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>✉️ {store.email}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-store_owner">Owner Account Verified</span>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
              Registered: {new Date(store.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon amber">⭐</div>
          <div>
            <div className="stat-label">Overall Average Rating</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span className="stat-value">
                {Number(average_rating) > 0 ? Number(average_rating).toFixed(1) : '0.0'}
              </span>
              <span style={{ fontSize: '1.1rem', color: '#64748b' }}>/ 5.0</span>
            </div>
            <div style={{ marginTop: '6px' }}>
              <StarRating value={average_rating} size={20} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">📝</div>
          <div>
            <div className="stat-label">Total Customer Ratings</div>
            <div className="stat-value">{total_ratings}</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '6px' }}>
              Submitted by verified normal users
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Submissions List */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.15rem' }}>Customer Ratings Submissions</h3>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
            {ratings.length} {ratings.length === 1 ? 'Submission' : 'Submissions'}
          </span>
        </div>

        {ratings.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px' }}>
            <div className="empty-state-icon">⭐</div>
            <div className="empty-state-title">No Ratings Submitted Yet</div>
            <div className="empty-state-text">Customers have not submitted any reviews for your store yet.</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleSort('name')}>
                    <span className="th-sort-wrapper">
                      Customer Name {renderSortIndicator('name')}
                    </span>
                  </th>
                  <th className="sortable" onClick={() => handleSort('email')}>
                    <span className="th-sort-wrapper">
                      Customer Email {renderSortIndicator('email')}
                    </span>
                  </th>
                  <th className="sortable" onClick={() => handleSort('rating')}>
                    <span className="th-sort-wrapper">
                      Rating {renderSortIndicator('rating')}
                    </span>
                  </th>
                  <th className="sortable" onClick={() => handleSort('date')}>
                    <span className="th-sort-wrapper">
                      Submitted / Modified Date {renderSortIndicator('date')}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.user_name}</td>
                    <td style={{ color: '#475569' }}>{r.user_email}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <StarRating value={r.rating} size={18} />
                        <span style={{ fontWeight: 700, color: '#1e293b' }}>{r.rating} ★</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {new Date(r.updated_at || r.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
