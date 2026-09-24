import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ConfigProvider, App as AntdApp, message, Layout, theme } from 'antd';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import InventorySection from './components/InventorySection';
import PostMovementPage from './components/PostMovementPage';
import MovementsPage from './components/MovementsPage';

const { Content } = Layout;
const { defaultAlgorithm, darkAlgorithm } = theme;
const API_BASE = 'http://localhost:3001/api';

function MainApp({ isDark, onToggleTheme }) {
  const [currentUser, setCurrentUser] = useState({
    email: 'admin@ashcol.local',
    role: 'Inventory Manager',
    fullName: 'Ashcol Warehouse Officer',
  });

  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem('ashcol_active_tab') || 'dashboard';
  });
  const [globalSearch, setGlobalSearch] = useState('');
  const [targetMovementItemId, setTargetMovementItemId] = useState(null);
  const [inventoryFilter, setInventoryFilter] = useState(null);

  const handlePageChange = (page) => {
    setActivePage(page);
    localStorage.setItem('ashcol_active_tab', page);
  };

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
    const intervalId = setInterval(loadData, 4000);
    return () => clearInterval(intervalId);
  }, []);

  const handleAddItem = (newItem) => {
    axios
      .post(`${API_BASE}/products`, newItem)
      .then((res) => {
        const saved = res.data;
        if (saved && saved.id) {
          setItems([saved, ...items]);
          message.success(`Item "${saved.name}" registered to inventory!`);
        }
      })
      .catch((err) => message.error('Failed to add item: ' + err.message));
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
          message.info(`Brand "${savedBrand.name}" registered!`);
        }
      })
      .catch((err) => console.error('Error saving brand:', err.message));
  };

  const handleAdjustStock = (itemId, delta, reason) => {
    axios
      .patch(`${API_BASE}/products/${itemId}/stock`, { delta, reason })
      .then((res) => {
        const resData = res.data;
        setItems(
          items.map((item) => {
            if (item.id === itemId) {
              return { ...item, quantity: resData.quantity };
            }
            return item;
          })
        );
        message.success('Stock movement successfully posted & saved to ledger!');
        setTargetMovementItemId(null);
        setActivePage('movements');
      })
      .catch((err) => message.error('Error adjusting stock: ' + err.message));
  };

  const handleDeleteItem = (itemId) => {
    axios
      .delete(`${API_BASE}/products/${itemId}`)
      .then(() => {
        setItems(items.filter(({ id }) => id !== itemId));
        message.success('Item deleted from inventory.');
      })
      .catch((err) => message.error('Error deleting item: ' + err.message));
  };

  if (!currentUser) {
    return <LoginPage onLogin={(user) => setCurrentUser(user)} />;
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: isDark ? '#0f172a' : '#f8fafc',
        color: isDark ? '#f8fafc' : '#0f172a',
        transition: 'background 0.2s',
      }}
    >
      <Sidebar
        activePage={activePage}
        setActivePage={handlePageChange}
        onLogout={() => {
          setCurrentUser(null);
          message.info('Logged out successfully');
        }}
        isDark={isDark}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar
          user={currentUser}
          searchTerm={globalSearch}
          onSearchChange={(val) => setGlobalSearch(val)}
          isDark={isDark}
          onToggleTheme={onToggleTheme}
        />

        <Content style={{ flex: 1, background: isDark ? '#0b1120' : '#f8fafc', transition: 'background 0.2s' }}>
          {activePage === 'dashboard' && (
            <DashboardPage
              items={items}
              movements={movements}
              onRestockItem={(itemId) => {
                setTargetMovementItemId(itemId);
                handlePageChange('post_movement');
              }}
              onNavigateToInventoryWithFilter={(filter) => {
                setInventoryFilter(filter);
                handlePageChange('inventory');
              }}
            />
          )}

          {activePage === 'inventory' && (
            <InventorySection
              items={items}
              brands={brands}
              onAddItem={handleAddItem}
              onDeleteItem={handleDeleteItem}
              onAddBrand={handleAddBrand}
              searchTerm={globalSearch}
              preselectedFilter={inventoryFilter}
              onNavigateToPostMovement={() => {
                setTargetMovementItemId(null);
                handlePageChange('post_movement');
              }}
            />
          )}

          {activePage === 'post_movement' && (
            <PostMovementPage
              items={items}
              onAdjustStock={handleAdjustStock}
              preselectedItemId={targetMovementItemId}
            />
          )}

          {activePage === 'movements' && (
            <MovementsPage movements={movements} />
          )}
        </Content>
      </div>
    </div>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: '#059669',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          colorInfo: '#2563eb',
          borderRadius: 8,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          colorBgContainer: isDark ? '#1e293b' : '#ffffff',
          colorBgLayout: isDark ? '#0b1120' : '#f8fafc',
        },
      }}
    >
      <AntdApp>
        <MainApp isDark={isDark} onToggleTheme={toggleTheme} />
      </AntdApp>
    </ConfigProvider>
  );
}
