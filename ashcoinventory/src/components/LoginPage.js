import React from 'react';
import { Card, Form, Input, Button, Typography, Space, theme } from 'antd';
import { LockOutlined, MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function LoginPage({ onLogin }) {
  const { token } = theme.useToken();

  const handleFinish = (values) => {
    onLogin({
      email: values.email || 'admin@ashcol.local',
      role: 'Inventory Manager',
      fullName: 'Ashcol Warehouse Officer',
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #e2e8f0 100%)',
        padding: '24px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 16,
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.07), 0 0 1px 1px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
        }}
        bordered={false}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              backgroundColor: '#059669',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 28,
              boxShadow: '0 8px 16px rgba(5, 150, 105, 0.25)',
              marginBottom: 16,
            }}
          >
            <SafetyCertificateOutlined />
          </div>
          <Title level={3} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>
            Ashcol Aircon Inventory
          </Title>
          <Text type="secondary" style={{ fontSize: 14, display: 'block', marginTop: 6 }}>
            Minimalist warehouse stocks, supplies & logistics management
          </Text>
        </div>

        <Form
          layout="vertical"
          size="large"
          initialValues={{
            email: 'admin@ashcol.local',
            password: 'admin123',
          }}
          onFinish={handleFinish}
        >
          <Form.Item
            name="email"
            label={<Text strong style={{ fontSize: 13 }}>Work Email</Text>}
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input
              prefix={<MailOutlined style={{ color: token.colorTextTertiary }} />}
              placeholder="e.g. admin@ashcol.local"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<Text strong style={{ fontSize: 13 }}>Password</Text>}
            rules={[{ required: true, message: 'Please enter your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: token.colorTextTertiary }} />}
              placeholder="Enter password"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{
                height: 46,
                fontWeight: 600,
                borderRadius: 8,
                backgroundColor: '#059669',
              }}
            >
              Sign In to Inventory
            </Button>
          </Form.Item>
        </Form>

        <Card
          size="small"
          style={{
            background: '#f8fafc',
            borderColor: '#e2e8f0',
            borderRadius: 10,
            marginTop: 8,
          }}
        >
          <Space direction="vertical" size={2}>
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>
              Quick Demo Access
            </Text>
            <Paragraph style={{ margin: 0, fontSize: 12 }} copyable>
              admin@ashcol.local / admin123
            </Paragraph>
          </Space>
        </Card>
      </Card>
    </div>
  );
}
