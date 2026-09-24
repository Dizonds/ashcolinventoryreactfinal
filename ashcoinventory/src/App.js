import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import InventorySection from './components/InventorySection';
import PostMovementPage from './components/PostMovementPage';
import MovementsPage from './components/MovementsPage';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [currentUser, setCurrentUser] = useState({
    email: 'admin@ashcol.local',
    role: 'Inventory Manager',
    fullName: 'Ashcol Warehouse Officer',
  });

  const [activePage, setActivePage] = useState('inventory');
  const [globalSearch, setGlobalSearch] = useState('');
  const [theme, setTheme] = useState('light');

  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [brands, setBrands] = useState([]);

  const loadData = () => {
    axios
      .get(`${API_BASE}/products`)
      .then((res) => {
        if (Array.isArray(res.data)) setItems(res.data);
      })
      .catch((err) => console.log(err.message));

    axios
      .get(`${API_BASE}/movements`)
      .then((res) => {
        if (Array.isArray(res.data)) setMovements(res.data);
      })
      .catch((err) => console.log(err.message));

    axios
      .get(`${API_BASE}/brands`)
      .then((res) => {
        if (Array.isArray(res.data)) setBrands(res.data);
      })
      .catch((err) => console.log(err.message));
  };

  useEffect(() => {
    loadData();
    const intervalId = setInterval(loadData, 3000);
    return () => clearInterval(intervalId);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const handleAddItem = (newItem) => {
    axios
      .post(`${API_BASE}/products`, newItem)
      .then((res) => {
        const saved = res.data;
        if (saved && saved.id) {
          setItems([saved, ...items]);
          alert(`Item "${saved.name}" successfully added to inventory!`);
        }
      })
      .catch((err) => alert('Error adding item: ' + err.message));
  };

  const handleAddBrand = (brandName) => {
    axios
      .post(`${API_BASE}/brands`, { name: brandName })
      .then((res) => {
        const savedBrand = res.data;
        if (savedBrand && savedBrand.name) {
          const matches = brands.filter(
            (b) => b.name.toLowerCase() === savedBrand.name.toLowerCase()
          );
          if (matches.length === 0) {
            setBrands([...brands, savedBrand]);
          }
          alert(`Brand "${savedBrand.name}" registered to database!`);
        }
      })
      .catch((err) => alert('Error saving brand: ' + err.message));
  };

  const handleAdjustStock = (itemId, delta, reason) => {
    axios
      .patch(`${API_BASE}/products/${itemId}/stock`, { delta, reason })
      .then((res) => {
        const resData = res.data;
        setItems(
          items.map((item) => {
            const { id } = item;
            if (id === itemId) {
              return { ...item, quantity: resData.quantity };
            }
            return item;
          })
        );
        alert('Stock movement successfully posted!');
        setActivePage('movements');
      })
      .catch((err) => alert('Error adjusting stock: ' + err.message));
  };

  const handleDeleteItem = (itemId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this inventory item?');
    if (!confirmDelete) return;

    axios
      .delete(`${API_BASE}/products/${itemId}`)
      .then(() => {
        setItems(items.filter(({ id }) => id !== itemId));
        alert('Item removed from inventory!');
      })
      .catch((err) => alert('Error deleting item: ' + err.message));
  };

  if (!currentUser) {
    return <LoginPage onLogin={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="layout">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={() => setCurrentUser(null)}
      />

      <div className="main-wrapper">
        <TopBar
          user={currentUser}
          theme={theme}
          onToggleTheme={toggleTheme}
          searchTerm={globalSearch}
          onSearchChange={(val) => setGlobalSearch(val)}
        />

        {activePage === 'dashboard' && (
          <DashboardPage items={items} movements={movements} />
        )}

        {activePage === 'inventory' && (
          <InventorySection
            items={items}
            brands={brands}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
            onAddBrand={handleAddBrand}
            searchTerm={globalSearch}
            onNavigateToPostMovement={() => setActivePage('post_movement')}
          />
        )}

        {activePage === 'post_movement' && (
          <PostMovementPage
            items={items}
            onAdjustStock={handleAdjustStock}
          />
        )}

        {activePage === 'movements' && (
          <MovementsPage movements={movements} />
        )}
      </div>
    </div>
  );
}

export default App;
