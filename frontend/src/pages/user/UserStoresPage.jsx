import React, { useState, useEffect } from 'react';
import { storeApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/Alert';
import StarRating from '../../components/StarRating';

export default function UserStoresPage() {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter state
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');

  // Track pending rating selections per store: { [storeId]: ratingValue }
  const [pendingRatings, setPendingRatings] = useState({});
  const [submittingStoreId, setSubmittingStoreId] = useState(null);

  useEffect(() => {
    fetchStores();
  }, [searchName, searchAddress, sortBy, sortOrder]);

  async function fetchStores() {
    try {
      setLoading(true);
      const params = {
        name: searchName || undefined,
        address: searchAddress || undefined,
        sortBy,
        sortOrder,
      };
      const res = await storeApi.getStores(params);
      const storeList = res.data.stores || [];
      setStores(storeList);

      // Initialize pending rating state with user's existing ratings
      const initialPending = {};
      storeList.forEach((s) => {
        if (s.user_rating) {
          initialPending[s.id] = s.user_rating;
        }
      });
      setPendingRatings(initialPending);
    } catch (err) {
      setError(err.message || 'Failed to fetch stores.');
    } finally {
      setLoading(false);
    }
  }

  function handleRatingSelect(storeId, ratingVal) {
    setPendingRatings((prev) => ({
      ...prev,
      [storeId]: ratingVal,
    }));
  }

  async function handleSubmitRating(storeId) {
    const selectedRating = pendingRatings[storeId];
    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }

    try {
      setSubmittingStoreId(storeId);
      setError('');
      setSuccess('');

      const res = await storeApi.submitRating(storeId, selectedRating);

      setSuccess(res.data.message || 'Rating saved successfully!');

      // Update store in local state with backend recalculated aggregates
      setStores((prevStores) =>
        prevStores.map((s) =>
          s.id === storeId
            ? {
                ...s,
                user_rating: res.data.rating,
                average_rating: res.data.average_rating,
                rating_count: res.data.rating_count,
              }
            : s
        )
      );
    } catch (err) {
      setError(err.message || 'Failed to submit rating.');
    } finally {
      setSubmittingStoreId(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Stores & Ratings</h1>
          <p className="page-subtitle">Discover local stores, inspect customer reviews, and share your ratings</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Search and Sort Toolbar */}
      <div className="filter-bar">
        <input
          type="text"
          className="form-input filter-input"
          placeholder="Search by store name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <input
          type="text"
          className="form-input filter-input"
          placeholder="Search by address..."
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
        />
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '160px' }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Sort by Name</option>
          <option value="average_rating">Sort by Average Rating</option>
          <option value="rating_count">Sort by Total Reviews</option>
        </select>
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '120px' }}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="ASC">Ascending</option>
          <option value="DESC">Descending</option>
        </select>
        {(searchName || searchAddress) && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearchName('');
              setSearchAddress('');
            }}
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Stores List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading stores...</div>
      ) : stores.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏬</div>
          <div className="empty-state-title">No Stores Found</div>
          <div className="empty-state-text">No stores match your search criteria. Try a different query.</div>
        </div>
      ) : (
        <div className="store-grid">
          {stores.map((store) => {
            const hasUserRated = !!store.user_rating;
            const currentSelected = pendingRatings[store.id] || store.user_rating || 0;
            const isSubmitting = submittingStoreId === store.id;

            return (
              <div key={store.id} className="store-card">
                <div>
                  <div className="store-card-header">
                    <h2 className="store-card-title">{store.name}</h2>
                    <div className="store-card-address">
                      📍 {store.address || 'Address not listed'}
                    </div>
                  </div>

                  <div className="store-rating-overview">
                    <StarRating value={store.average_rating} size={22} />
                    <div>
                      <span className="rating-score">
                        {Number(store.average_rating) > 0 ? Number(store.average_rating).toFixed(1) : 'Unrated'}
                      </span>
                      <span className="rating-count">
                        {' '}({store.rating_count} {store.rating_count === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="user-rating-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                      {hasUserRated ? 'Your Rating (Click to edit):' : 'Rate this store:'}
                    </span>
                    {hasUserRated && (
                      <span className="badge badge-user" style={{ fontSize: '0.72rem' }}>
                        Rated: {store.user_rating} ★
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                    <StarRating
                      interactive={true}
                      value={currentSelected}
                      onChange={(star) => handleRatingSelect(store.id, star)}
                      size={26}
                    />

                    <button
                      type="button"
                      className={`btn ${hasUserRated ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                      disabled={isSubmitting || !currentSelected || currentSelected === store.user_rating}
                      onClick={() => handleSubmitRating(store.id)}
                    >
                      {isSubmitting
                        ? 'Saving...'
                        : hasUserRated
                        ? 'Modify Rating'
                        : 'Submit Rating'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
