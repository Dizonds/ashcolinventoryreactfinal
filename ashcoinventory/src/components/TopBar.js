import React from 'react';
import { Input, Avatar, Tag, Space, Typography, Tooltip, Button, theme } from 'antd';
import { SearchOutlined, UserOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function TopBar({ user, searchTerm, onSearchChange, isDark, onToggleTheme }) {
  const { token } = theme.useToken();
  const { role, fullName } = user || {};
  const userInitials = (fullName || 'Admin')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        height: 64,
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 90,
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Input
          prefix={<SearchOutlined style={{ color: token.colorTextTertiary, marginRight: 4 }} />}
          placeholder="Search AC models, brands, parts, SKU..."
          allowClear
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            borderRadius: 8,
          }}
        />
      </div>

      <Space size="middle" align="center">
        {/* Dark Mode / Light Mode Toggle Button */}
        <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          <Button
            type="text"
            shape="circle"
            icon={isDark ? <SunOutlined style={{ color: '#f59e0b', fontSize: 17 }} /> : <MoonOutlined style={{ fontSize: 17 }} />}
            onClick={onToggleTheme}
          />
        </Tooltip>

        <Tag
          color={role === 'Technician' ? 'blue' : 'cyan'}
          style={{ borderRadius: 6, fontWeight: 600, padding: '2px 8px' }}
        >
          {(role || 'OFFICER').toUpperCase()}
        </Tag>

        <Space size="small">
          <Avatar
            style={{
              backgroundColor: role === 'Technician' ? '#2563eb' : '#059669',
              fontWeight: 600,
              boxShadow: role === 'Technician'
                ? '0 2px 6px rgba(37, 99, 235, 0.25)'
                : '0 2px 6px rgba(5, 150, 105, 0.2)',
            }}
          >
            {userInitials || <UserOutlined />}
          </Avatar>
          <div>
            <Text strong style={{ fontSize: 13, display: 'block', lineHeight: 1.2 }}>
              {fullName}
            </Text>
          </div>
        </Space>
      </Space>
    </div>
  );
}
