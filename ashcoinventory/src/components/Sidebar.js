import React from 'react';
import { DashboardIcon, ProductsIcon, StockTransferIcon, LedgerIcon, LogoutIcon } from './Icons';

export default function Sidebar({ activePage, setActivePage, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'inventory', label: 'Inventory Items', icon: <ProductsIcon /> },
    { id: 'post_movement', label: 'Post Movement', icon: <StockTransferIcon /> },
    { id: 'movements', label: 'Stock Ledger', icon: <LedgerIcon /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src="./assets/ash-logo.jpg" alt="Ashcol" className="sb-logo" />
        <div className="b-text">
          <strong>Ashcol Aircon</strong>
          <span>Inventory System</span>
        </div>
      </div>
      <div className="sidebar-divider" />

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const { id, label, icon } = item;
          return (
            <button
              key={id}
              className={`nav-item ${activePage === id ? 'active' : ''}`}
              onClick={() => setActivePage(id)}
            >
              <span className="nav-icon-wrap">{icon}</span>
              {label}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="btn-logout" onClick={onLogout}>
          <span className="nav-icon">
            <LogoutIcon />
          </span>
          Log Out
        </button>
      </div>
    </aside>
  );
}
