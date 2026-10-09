import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="empty-state" style={{ maxWidth: '500px', margin: '60px auto' }}>
      <div className="empty-state-icon">🔍</div>
      <h2 className="empty-state-title">Page Not Found</h2>
      <p className="empty-state-text" style={{ marginBottom: '20px' }}>
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        Go to Homepage
      </Link>
    </div>
  );
}
