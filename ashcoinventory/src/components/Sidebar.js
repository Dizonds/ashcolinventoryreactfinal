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
  const [isHovered, setIsHovered] = React.useState(false);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined style={{ fontSize: 18 }} />,
      label: 'Dashboard Overview',
    },
    {
      key: 'inventory',
      icon: <AppstoreOutlined style={{ fontSize: 18 }} />,
      label: 'Inventory Catalog',
    },
    {
      key: 'post_movement',
      icon: <SwapOutlined style={{ fontSize: 18 }} />,
      label: 'Post Movement',
    },
    {
      key: 'movements',
      icon: <HistoryOutlined style={{ fontSize: 18 }} />,
      label: 'Stock Ledger',
    },
  ];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: isHovered ? 250 : 72,
        height: '100vh',
        background: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        zIndex: 100,
        transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      {/* Brand Header with Original Ashcol Logo */}
      <div
        style={{
          padding: isHovered ? '16px 16px' : '16px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isHovered ? 'flex-start' : 'center',
          gap: 12,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          minHeight: 70,
          overflow: 'hidden',
          transition: 'padding 0.2s ease',
        }}
      >
        <div
          style={{
            width: 72,
            minWidth: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <img
            src="/assets/ash-logo.jpg"
            alt="Ashcol Aircon"
            style={{
              width: 44,
              height: 44,
              objectFit: 'contain',
              display: 'block',
            }}
            onError={(e) => {
              // fallback if public path varies
              e.currentTarget.src = './assets/ash-logo.jpg';
            }}
          />
        </div>
        <div
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateX(0)' : 'translateX(-8px)',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
            overflow: 'hidden',
            pointerEvents: isHovered ? 'auto' : 'none',
          }}
        >
          <Text strong style={{ fontSize: 15, display: 'block', lineHeight: 1.2 }}>
            Ashcol Aircon
          </Text>
          <Text type="secondary" style={{ fontSize: 11, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
            Inventory System
          </Text>
        </div>
      </div>

      {/* Navigation Menu */}
      <div
        style={{
          flex: 1,
          padding: isHovered ? '12px 8px' : '12px 0',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isHovered ? 'stretch' : 'center',
        }}
      >
        <Menu
          mode="inline"
          inlineCollapsed={!isHovered}
          selectedKeys={[activePage]}
          onClick={({ key }) => setActivePage(key)}
          style={{
            borderRight: 'none',
            background: 'transparent',
            width: isHovered ? '100%' : 72,
          }}
          items={menuItems}
        />
      </div>

      {/* Footer / Logout */}
      <div
        style={{
          padding: isHovered ? '14px 16px' : '14px 0',
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isHovered ? 'flex-start' : 'center',
          transition: 'padding 0.2s ease',
        }}
      >
        <Button
          type="text"
          danger
          block={isHovered}
          icon={<LogoutOutlined style={{ fontSize: 20 }} />}
          onClick={onLogout}
          title={!isHovered ? 'Log Out' : undefined}
          style={{
            textAlign: isHovered ? 'left' : 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isHovered ? 'flex-start' : 'center',
            height: 44,
            width: isHovered ? '100%' : 48,
            borderRadius: 8,
            padding: isHovered ? '0 12px' : 0,
            overflow: 'hidden',
            margin: '0 auto',
          }}
        >
          {isHovered && (
            <span style={{ marginLeft: 8, fontWeight: 500 }}>
              Log Out
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
