import React from 'react';
import { Menu, Typography, Button, theme } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  SwapOutlined,
  HistoryOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

export default function Sidebar({ activePage, setActivePage, onLogout, isDark }) {
  const { token } = theme.useToken();

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined style={{ fontSize: 16 }} />,
      label: 'Dashboard Overview',
    },
    {
      key: 'inventory',
      icon: <AppstoreOutlined style={{ fontSize: 16 }} />,
      label: 'Inventory Catalog',
    },
    {
      key: 'post_movement',
      icon: <SwapOutlined style={{ fontSize: 16 }} />,
      label: 'Post Movement',
    },
    {
      key: 'movements',
      icon: <HistoryOutlined style={{ fontSize: 16 }} />,
      label: 'Stock Ledger',
    },
  ];

  return (
    <div
      style={{
        width: 250,
        height: '100vh',
        background: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      {/* Brand Header with Original Ashcol Logo */}
      <div
        style={{
          padding: '18px 18px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <img
          src="/assets/ash-logo.jpg"
          alt="Ashcol Aircon"
          style={{
            width: 42,
            height: 42,
            borderRadius: 8,
            objectFit: 'contain',
            border: `1px solid ${token.colorBorderSecondary}`,
            background: '#ffffff',
            padding: 2,
          }}
          onError={(e) => {
            // fallback if public path varies
            e.currentTarget.src = './assets/ash-logo.jpg';
          }}
        />
        <div style={{ overflow: 'hidden' }}>
          <Text strong style={{ fontSize: 15, display: 'block', lineHeight: 1.2 }}>
            Ashcol Aircon
          </Text>
          <Text type="secondary" style={{ fontSize: 11, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
            Inventory System
          </Text>
        </div>
      </div>

      {/* Navigation Menu */}
      <div style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        <Menu
          mode="inline"
          selectedKeys={[activePage]}
          onClick={({ key }) => setActivePage(key)}
          style={{ borderRight: 'none', background: 'transparent' }}
          items={menuItems}
        />
      </div>

      {/* Footer / Logout */}
      <div style={{ padding: '16px', borderTop: `1px solid ${token.colorBorderSecondary}` }}>
        <Button
          type="text"
          danger
          block
          icon={<LogoutOutlined />}
          onClick={onLogout}
          style={{
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            height: 40,
            borderRadius: 8,
          }}
        >
          Log Out
        </Button>
      </div>
    </div>
  );
}
