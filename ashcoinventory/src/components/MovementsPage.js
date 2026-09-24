import React from 'react';
import { Card, Table, Tag, Typography, Space, Empty } from 'antd';
import { HistoryOutlined, ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function MovementsPage({ movements }) {
  const columns = [
    {
      title: 'Timestamp / Date',
      dataIndex: 'date',
      key: 'date',
      width: 140,
      render: (date) => <Text style={{ fontSize: 13 }}>{date || '—'}</Text>,
    },
    {
      title: 'SKU / Model',
      dataIndex: 'sku',
      key: 'sku',
      width: 150,
      render: (sku) => (
        <Text code style={{ fontWeight: 600 }}>
          {sku}
        </Text>
      ),
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Movement Type',
      dataIndex: 'movementType',
      key: 'movementType',
      width: 160,
      render: (type, record) => {
        const isStockIn = type === 'STOCK_IN' || record.quantityDelta > 0;
        return (
          <Tag
            color={isStockIn ? 'success' : 'volcano'}
            icon={isStockIn ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
            style={{ fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}
          >
            {isStockIn ? 'STOCK IN' : 'STOCK OUT'}
          </Tag>
        );
      },
    },
    {
      title: 'Quantity',
      dataIndex: 'quantityDelta',
      key: 'quantityDelta',
      width: 120,
      render: (qty, record) => {
        const isPositive = qty > 0 || record.movementType === 'STOCK_IN';
        return (
          <Text
            strong
            style={{
              color: isPositive ? '#059669' : '#dc2626',
              fontSize: 14,
            }}
          >
            {qty > 0 ? `+${qty}` : qty}
          </Text>
        );
      },
    },
    {
      title: 'Reason / Reference Notes',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason) => <Text type="secondary">{reason || 'Warehouse Movement'}</Text>,
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.3px' }}>
          Stock Movements Ledger
        </Title>
        <Paragraph type="secondary" style={{ margin: '4px 0 0', fontSize: 14 }}>
          Comprehensive immutable audit trail of supplier deliveries, returns, field installations, and dispatches.
        </Paragraph>
      </div>

      <Card
        title={
          <Space>
            <HistoryOutlined style={{ color: '#059669' }} />
            <Text strong style={{ fontSize: 16 }}>
              Movement Transaction Records ({movements.length})
            </Text>
          </Space>
        }
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
        }}
        bordered={false}
      >
        <Table
          dataSource={movements}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 15, showSizeChanger: true, pageSizeOptions: ['10', '15', '25', '50'] }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No stock movements recorded yet. Movements appear here automatically when items are added or adjusted."
              />
            ),
          }}
        />
      </Card>
    </div>
  );
}
