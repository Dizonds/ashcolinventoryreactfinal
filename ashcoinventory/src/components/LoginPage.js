import React, { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('admin@ashcol.local');
  const [password, setPassword] = useState('admin123');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      onLogin({ email, role: 'Inventory Manager', fullName: 'Ashcol Warehouse Officer' });
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-logo">
          <img src="./assets/ash-logo.jpg" alt="Ashcol Airconditioning" className="login-logo-img" />
        </div>
        <h2 className="login-title">Ashcol AC Inventory</h2>
        <p className="login-sub">Sign in to manage aircon warehouse stocks & spare parts.</p>

        <form onSubmit={handleLoginSubmit}>
          <div className="login-field">
            <span className="login-field-label">Email</span>
            <input
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter warehouse email"
              required
            />
          </div>

          <div className="login-field">
            <span className="login-field-label">Password</span>
            <input
              type="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>

          <button type="submit" className="btn-signin">
            Access Inventory Portal
          </button>
        </form>

        <div className="demo-hint">
          <p className="dem-label">Demo Credentials</p>
          <p>
            <strong>admin@ashcol.local</strong> / admin123 (Inventory Manager)
          </p>
        </div>
      </div>
    </div>
  );
}
