import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  function getBadgeClass(role) {
    if (role === 'ADMIN') return 'badge-admin';
    if (role === 'STORE_OWNER') return 'badge-store_owner';
    return 'badge-user';
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">★</span>
            <span>Store Rating Portal</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <ul className="navbar-links">
              {isAuthenticated && user?.role === 'ADMIN' && (
                <>
                  <li>
                    <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
                      Dashboard
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'active' : '')}>
                      Users
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/stores" className={({ isActive }) => (isActive ? 'active' : '')}>
                      Stores
                    </NavLink>
                  </li>
                </>
              )}

              {isAuthenticated && user?.role === 'USER' && (
                <li>
                  <NavLink to="/stores" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Browse Stores
                  </NavLink>
                </li>
              )}

              {isAuthenticated && user?.role === 'STORE_OWNER' && (
                <li>
                  <NavLink to="/owner/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
                    My Store Dashboard
                  </NavLink>
                </li>
              )}
            </ul>

            <div className="navbar-user">
              {isAuthenticated ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                      {user.name.length > 25 ? user.name.slice(0, 22) + '...' : user.name}
                    </span>
                    <span className={`badge ${getBadgeClass(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsPasswordModalOpen(true)}
                  >
                    Password
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link to="/login" className="btn btn-secondary btn-sm">
                    Log In
                  </Link>
                  <Link to="/signup" className="btn btn-primary btn-sm">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {isAuthenticated && (
        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}
    </>
  );
}
