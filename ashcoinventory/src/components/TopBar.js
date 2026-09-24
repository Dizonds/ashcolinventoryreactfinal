import React from 'react';
import { SearchIcon } from './Icons';

export default function TopBar({ user, theme, onToggleTheme, searchTerm, onSearchChange }) {
  const { role, fullName } = user;
  const userInitials = fullName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="top-bar">
      <div className="top-bar-search">
        <span className="search-icon">
          <SearchIcon />
        </span>
        <input
          type="text"
          placeholder="Search AC models, brands, parts, SKU..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="top-bar-user">
        <button
          type="button"
          className="btn-theme-toggle"
          onClick={onToggleTheme}
          title="Toggle Theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <span className="user-role-badge">{role.toUpperCase()}</span>
        <div className="user-avatar-top">{userInitials}</div>
      </div>
    </div>
  );
}
