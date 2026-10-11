import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import Alert from '../../components/Alert';
import Modal from '../../components/Modal';
import StarRating from '../../components/StarRating';

export default function AdminStoresPage() {
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters and sorting state
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    sortBy: 'created_at',
    sortOrder: 'DESC',
  });

  // Add store modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    email: '',
    address: '',
    owner_user_id: '',
  });
  const [modalError, setModalError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchStores();
  }, [filters]);

  async function fetchStores() {
    try {
      setLoading(true);
      const params = {};
      if (filters.name) params.name = filters.name;
      if (filters.email) params.email = filters.email;
      if (filters.address) params.address = filters.address;
      params.sortBy = filters.sortBy;
      params.sortOrder = filters.sortOrder;

      const res = await adminApi.getStores(params);
      setStores(res.data.stores || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch stores list.');
    } finally {
      setLoading(false);
    }
  }

  async function openAddModal() {
    setModalError('');
    setIsAddModalOpen(true);
    // Load store owners for selector
    try {
      const res = await adminApi.getUsers({ role: 'STORE_OWNER' });
      const storeOwners = res.data.users || [];
      setOwners(storeOwners);
      if (storeOwners.length > 0) {
        setNewStore((prev) => ({ ...prev, owner_user_id: storeOwners[0].id }));
      }
    } catch (err) {
      setModalError('Could not load store owners. Ensure store owner accounts exist.');
    }
  }

  async function handleCreateStore(e) {
    e.preventDefault();
    setModalError('');

    const trimmedName = newStore.name.trim();
    if (trimmedName.length < 20 || trimmedName.length > 60) {
      setModalError(`Store name must be between 20 and 60 characters. Current length: ${trimmedName.length}.`);
      return;
    }

    if (!newStore.owner_user_id) {
      setModalError('Please select a store owner.');
      return;
    }

    if (newStore.address && newStore.address.trim().length > 400) {
      setModalError('Address cannot exceed 400 characters.');
      return;
    }

    try {
      setCreating(true);
      await adminApi.createStore({
        name: trimmedName,
        email: newStore.email.trim().toLowerCase(),
        address: newStore.address ? newStore.address.trim() : null,
        owner_user_id: parseInt(newStore.owner_user_id, 10),
      });

      setSuccess(`Store "${trimmedName}" created and assigned successfully.`);
      setIsAddModalOpen(false);
      setNewStore({ name: '', email: '', address: '', owner_user_id: '' });
      fetchStores();
    } catch (err) {
      setModalError(err.message || 'Failed to create store.');
    } finally {
      setCreating(false);
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
      sortBy: 'created_at',
      sortOrder: 'DESC',
    });
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Store Management</h1>
          <p className="page-subtitle">Register stores, assign owners, and monitor ratings across the platform</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openAddModal}>
          ➕ Add New Store
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Filters & Sorting */}
      <div className="filter-bar">
        <input
          type="text"
          className="form-input filter-input"
          placeholder="Filter by store name..."
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
          style={{ width: 'auto', minWidth: '150px' }}
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        >
          <option value="created_at">Sort: Created Date</option>
          <option value="name">Sort: Store Name</option>
          <option value="email">Sort: Store Email</option>
          <option value="address">Sort: Store Address</option>
          <option value="average_rating">Sort: Average Rating</option>
          <option value="rating_count">Sort: Total Ratings</option>
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

      {/* Stores Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading stores...</div>
      ) : stores.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏬</div>
          <div className="empty-state-title">No Stores Found</div>
          <div className="empty-state-text">No stores matched your search criteria. Add a new store or modify filters.</div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => handleSort('name')}>
                  <span className="th-sort-wrapper">
                    Store Name {renderSortIndicator('name')}
                  </span>
                </th>
                <th className="sortable" onClick={() => handleSort('email')}>
                  <span className="th-sort-wrapper">
                    Store Email {renderSortIndicator('email')}
                  </span>
                </th>
                <th className="sortable" onClick={() => handleSort('address')}>
                  <span className="th-sort-wrapper">
                    Address {renderSortIndicator('address')}
                  </span>
                </th>
                <th>Assigned Store Owner</th>
                <th className="sortable" onClick={() => handleSort('average_rating')}>
                  <span className="th-sort-wrapper">
                    Overall Rating {renderSortIndicator('average_rating')}
                  </span>
                </th>
                <th className="sortable" onClick={() => handleSort('rating_count')}>
                  <span className="th-sort-wrapper">
                    Reviews {renderSortIndicator('rating_count')}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{s.email}</td>
                  <td style={{ maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.address || <span style={{ color: '#94a3b8' }}>None</span>}
                  </td>
                  <td>
                    <div>
                      <span style={{ fontWeight: 500 }}>{s.owner_name}</span>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.owner_email}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <StarRating value={s.average_rating} />
                      <span style={{ fontWeight: 600 }}>
                        {Number(s.average_rating) > 0 ? Number(s.average_rating).toFixed(1) : 'Unrated'}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {s.rating_count} {s.rating_count === 1 ? 'review' : 'reviews'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Store Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Store">
        {modalError && <Alert type="error" message={modalError} />}
        <form onSubmit={handleCreateStore}>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Store Name</label>
              <span style={{ fontSize: '0.75rem', color: newStore.name.trim().length < 20 || newStore.name.trim().length > 60 ? '#dc2626' : '#16a34a' }}>
                {newStore.name.trim().length}/60 chars (min 20)
              </span>
            </div>
            <input
              type="text"
              className="form-input"
              value={newStore.name}
              onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
              placeholder="e.g. Downtown Gourmet Artisan Bakery"
              required
              minLength={20}
              maxLength={60}
            />
            <div className="form-hint">Must be 20 to 60 characters per assignment constraint.</div>
          </div>

          <div className="form-group">
            <label className="form-label">Store Email</label>
            <input
              type="email"
              className="form-input"
              value={newStore.email}
              onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
              placeholder="e.g. contact@downtownbakery.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Store Address</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={newStore.address}
              onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
              placeholder="e.g. 456 Commerce Boulevard, West End (max 400 chars)"
              maxLength={400}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Associated Store Owner</label>
            {owners.length === 0 ? (
              <div style={{ color: '#dc2626', fontSize: '0.85rem' }}>
                No users with the STORE_OWNER role exist yet. Please create a Store Owner user first in User Management!
              </div>
            ) : (
              <select
                className="form-select"
                value={newStore.owner_user_id}
                onChange={(e) => setNewStore({ ...newStore, owner_user_id: e.target.value })}
                required
              >
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
            )}
            <div className="form-hint">Only accounts with role STORE_OWNER can be associated.</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={creating || owners.length === 0}>
              {creating ? 'Registering...' : 'Register Store'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
