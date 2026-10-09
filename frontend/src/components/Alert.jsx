import React from 'react';

export default function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;

  return (
    <div className={`alert ${type === 'success' ? 'alert-success' : 'alert-error'}`} role="alert">
      <div style={{ flex: 1 }}>{message}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}
          aria-label="Close notification"
        >
          ×
        </button>
      )}
    </div>
  );
}
