import React from 'react';
import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="empty-state" style={{ maxWidth: '500px', margin: '60px auto' }}>
      <div className="empty-state-icon" style={{ color: '#dc2626' }}>⛔</div>
      <h2 className="empty-state-title">Access Denied</h2>
      <p className="empty-state-text" style={{ marginBottom: '20px' }}>
        You do not have permission to view this resource. Your account role is not authorized for this action.
      </p>
      <Link to="/" className="btn btn-primary">
        Return to Home
      </Link>
    </div>
  );
}
