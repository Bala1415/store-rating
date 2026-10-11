import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import Alert from '../../components/Alert';
import Modal from '../../components/Modal';
import StarRating from '../../components/StarRating';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters and Sorting state
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: '',
    sortBy: 'created_at',
    sortOrder: 'DESC',
  });

  // Add User modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'USER',
  });
  const [modalError, setModalError] = useState('');
  const [creating, setCreating] = useState(false);

  // User Details modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  async function fetchUsers() {
    try {
      setLoading(true);
      const params = {};
      if (filters.name) params.name = filters.name;
      if (filters.email) params.email = filters.email;
      if (filters.address) params.address = filters.address;
      if (filters.role) params.role = filters.role;
      params.sortBy = filters.sortBy;
      params.sortOrder = filters.sortOrder;

      const res = await adminApi.getUsers(params);
      setUsers(res.data.users || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch users list.');
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function handleSort(columnKey) {
    setFilters((prev) => ({
      ...prev,
      sortBy: columnKey,
      sortOrder: prev.sortBy === columnKey && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC',
    }));
  }

  function renderSortIndicator(columnKey) {
    if (filters.sortBy !== columnKey) return <span className="sort-indicator">↕</span>;
    return <span className="sort-indicator active">{filters.sortOrder === 'ASC' ? '▲' : '▼'}</span>;
  }

  function clearFilters() {
    setFilters({
      name: '',
      email: '',
      address: '',
      role: '',
      sortBy: 'created_at',
      sortOrder: 'DESC',
    });
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setModalError('');

    const trimmedName = newUser.name.trim();
    if (trimmedName.length < 20 || trimmedName.length > 60) {
      setModalError(`Name must be between 20 and 60 characters. Current length: ${trimmedName.length}.`);
      return;
    }

    if (newUser.password.length < 8 || newUser.password.length > 16) {
      setModalError('Password must be between 8 and 16 characters.');
      return;
    }

    if (!/[A-Z]/.test(newUser.password)) {
      setModalError('Password must contain at least one uppercase letter.');
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newUser.password)) {
      setModalError('Password must contain at least one special character.');
      return;
    }

    if (newUser.address && newUser.address.trim().length > 400) {
      setModalError('Address cannot exceed 400 characters.');
      return;
    }

    try {
      setCreating(true);
      await adminApi.createUser({
        name: trimmedName,
        email: newUser.email.trim().toLowerCase(),
        password: newUser.password,
        address: newUser.address ? newUser.address.trim() : null,
        role: newUser.role,
      });

      setSuccess(`User "${trimmedName}" created successfully with role ${newUser.role}.`);
      setIsAddModalOpen(false);
      setNewUser({ name: '', email: '', password: '', address: '', role: 'USER' });
      fetchUsers();
    } catch (err) {
      setModalError(err.message || 'Failed to create user.');
    } finally {
      setCreating(false);
    }
  }

  async function handleViewDetails(userId) {
    try {
      setLoadingDetails(true);
      setIsDetailsModalOpen(true);
      const res = await adminApi.getUserById(userId);
      setSelectedUser(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load user details.');
      setIsDetailsModalOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  }

  function getBadgeClass(role) {
    if (role === 'ADMIN') return 'badge-admin';
    if (role === 'STORE_OWNER') return 'badge-store_owner';
    return 'badge-user';
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">View, search, filter, and create user accounts across all roles</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setModalError('');
            setIsAddModalOpen(true);
          }}
        >
          ➕ Add New User
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Filter and Sorting Controls */}
      <div className="filter-bar">
        <input
          type="text"
          className="form-input filter-input"
          placeholder="Filter by name..."
          value={filters.name}
          onChange={(e) => handleFilterChange('name', e.target.value)}
        />
        <input
          type="text"
          className="form-input filter-input"
          placeholder="Filter by email..."
          value={filters.email}
          onChange={(e) => handleFilterChange('email', e.target.value)}
        />
        <input
          type="text"
          className="form-input filter-input"
          placeholder="Filter by address..."
          value={filters.address}
          onChange={(e) => handleFilterChange('address', e.target.value)}
        />
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '130px' }}
          value={filters.role}
          onChange={(e) => handleFilterChange('role', e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="USER">USER</option>
          <option value="STORE_OWNER">STORE_OWNER</option>
        </select>
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '130px' }}
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        >
          <option value="created_at">Sort: Created Date</option>
          <option value="name">Sort: Name</option>
          <option value="email">Sort: Email</option>
          <option value="address">Sort: Address</option>
          <option value="role">Sort: Role</option>
        </select>
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '120px' }}
          value={filters.sortOrder}
          onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
        >
          <option value="DESC">Descending</option>
          <option value="ASC">Ascending</option>
        </select>
        <button type="button" className="btn btn-secondary btn-sm" onClick={clearFilters}>
          Clear
        </button>
      </div>

      {/* Users Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading users...</div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-title">No Users Found</div>
          <div className="empty-state-text">No accounts matched your search criteria. Try modifying your filters.</div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('name')}>
                  <span className="th-sort-wrapper">
                    Name {renderSortIndicator('name')}
                  </span>
                </th>
                <th className="sortable" onClick={() => handleSort('email')}>
                  <span className="th-sort-wrapper">
                    Email {renderSortIndicator('email')}
                  </span>
                </th>
                <th className="sortable" onClick={() => handleSort('address')}>
                  <span className="th-sort-wrapper">
                    Address {renderSortIndicator('address')}
                  </span>
                </th>
                <th className="sortable" onClick={() => handleSort('role')}>
                  <span className="th-sort-wrapper">
                    Role {renderSortIndicator('role')}
                  </span>
                </th>
                <th className="sortable" onClick={() => handleSort('created_at')}>
                  <span className="th-sort-wrapper">
                    Created {renderSortIndicator('created_at')}
                  </span>
                </th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.address || <span style={{ color: '#94a3b8' }}>None</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span className={`badge ${getBadgeClass(u.role)}`}>{u.role.replace('_', ' ')}</span>
                      {u.role === 'STORE_OWNER' && (
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#d97706' }}>
                          ⭐ {u.store_rating ? Number(u.store_rating).toFixed(1) : 'Unrated'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleViewDetails(u.id)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New User">
        {modalError && <Alert type="error" message={modalError} />}
        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Full Name</label>
              <span style={{ fontSize: '0.75rem', color: newUser.name.trim().length < 20 || newUser.name.trim().length > 60 ? '#dc2626' : '#16a34a' }}>
                {newUser.name.trim().length}/60 chars (min 20)
              </span>
            </div>
            <input
              type="text"
              className="form-input"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="e.g. System Administrator Roxiler"
              required
              minLength={20}
              maxLength={60}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="e.g. user@roxiler.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="••••••••"
              required
              minLength={8}
              maxLength={16}
            />
            <div className="form-hint">8–16 chars, 1 uppercase letter, 1 special character.</div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={newUser.address}
              onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
              placeholder="e.g. 100 Corporate Parkway (max 400 chars)"
              maxLength={400}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="USER">Normal User (USER)</option>
              <option value="STORE_OWNER">Store Owner (STORE_OWNER)</option>
              <option value="ADMIN">System Administrator (ADMIN)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* User Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title="User Profile Details">
        {loadingDetails || !selectedUser ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Loading details...</div>
        ) : (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Name</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{selectedUser.user.name}</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Email</div>
              <div style={{ fontSize: '0.95rem' }}>{selectedUser.user.email}</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Role</div>
              <span className={`badge ${getBadgeClass(selectedUser.user.role)}`}>
                {selectedUser.user.role.replace('_', ' ')}
              </span>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Address</div>
              <div style={{ fontSize: '0.95rem' }}>{selectedUser.user.address || 'No address provided'}</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Account Created</div>
              <div style={{ fontSize: '0.95rem' }}>{new Date(selectedUser.user.created_at).toLocaleString()}</div>
            </div>

            {/* If user is Store Owner, display associated store and ratings info */}
            {selectedUser.user.role === 'STORE_OWNER' && (
              <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '8px', color: '#1e40af' }}>
                  Associated Store Information
                </h4>
                {selectedUser.store ? (
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{selectedUser.store.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
                      {selectedUser.store.address}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <StarRating value={selectedUser.store.average_rating} />
                      <span style={{ fontWeight: 700 }}>{selectedUser.store.average_rating} / 5</span>
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        ({selectedUser.store.rating_count} {selectedUser.store.rating_count === 1 ? 'rating' : 'ratings'})
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.88rem', color: '#64748b', fontStyle: 'italic' }}>
                    No store is currently associated with this owner account.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
