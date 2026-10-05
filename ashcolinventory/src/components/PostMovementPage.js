import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Form,
  Select,
  Input,
  InputNumber,
  Radio,
  Button,
  Typography,
  Space,
  Alert,
  Divider,
  Statistic,
} from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { formatMoney } from '../utils/formatters';

const { Title, Text, Paragraph } = Typography;

export default function PostMovementPage({ items, onAdjustStock, preselectedItemId, user }) {
  const isTechnician = user?.role === 'Technician';
  const [form] = Form.useForm();
  const [selectedItemId, setSelectedItemId] = useState(preselectedItemId || '');
  const [movementType, setMovementType] = useState(isTechnician ? 'STOCK_OUT' : 'STOCK_IN');
  const [previewQty, setPreviewQty] = useState(0);

  // Sync when preselectedItemId changes or on mount
  useEffect(() => {
    if (preselectedItemId) {
      setSelectedItemId(preselectedItemId);
      form.setFieldsValue({
        itemId: preselectedItemId,
        movementType: isTechnician ? 'STOCK_OUT' : 'STOCK_IN',
        reason: isTechnician ? 'Client Installation / Site Project' : 'Supplier Delivery / Restock',
      });
    }
  }, [preselectedItemId, form, isTechnician]);

  const selectedItem = items.find(({ id }) => id === selectedItemId);

  const handleFinish = (values) => {
    const qty = Number(values.quantity);
    if (!qty || qty <= 0) return;

    if (movementType === 'STOCK_OUT' && selectedItem && qty > selectedItem.quantity) {
      alert(`Cannot dispatch ${qty} units. Only ${selectedItem.quantity} units currently available in warehouse!`);
      return;
    }

    const delta = movementType === 'STOCK_IN' ? qty : -qty;
    const finalReason = values.reason === 'Other' ? values.customReason || 'Manual Adjustment' : values.reason;

    onAdjustStock(values.itemId, delta, finalReason);
    form.resetFields();
    setSelectedItemId('');
    setPreviewQty(0);
    setMovementType('STOCK_IN');
  };

  const calculatedNewStock = selectedItem
    ? movementType === 'STOCK_IN'
      ? selectedItem.quantity + (previewQty || 0)
      : selectedItem.quantity - (previewQty || 0)
    : 0;

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.3px' }}>
          Post Stock Movement
        </Title>
        <Paragraph type="secondary" style={{ margin: '4px 0 0', fontSize: 14 }}>
          Adjust warehouse stocks for incoming shipments, returns, installation job orders, or dispatches.
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                {movementType === 'STOCK_IN' ? (
                  <ArrowDownOutlined style={{ color: '#059669' }} />
                ) : (
                  <ArrowUpOutlined style={{ color: '#dc2626' }} />
                )}
                <Text strong style={{ fontSize: 16 }}>
                  Stock Adjustment Form
                </Text>
              </Space>
            }
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
            }}
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                movementType: isTechnician ? 'STOCK_OUT' : 'STOCK_IN',
                reason: isTechnician ? 'Client Installation / Site Project' : 'Supplier Delivery / Restock',
              }}
              onFinish={handleFinish}
              onValuesChange={(changed) => {
                if (changed.movementType) setMovementType(changed.movementType);
                if (changed.itemId) setSelectedItemId(changed.itemId);
                if ('quantity' in changed) setPreviewQty(Number(changed.quantity) || 0);
              }}
            >
              <Form.Item label={<Text strong>Operation Type</Text>} name="movementType">
                <Radio.Group buttonStyle="solid" style={{ width: '100%', display: 'flex' }}>
                  <Radio.Button
                    value="STOCK_IN"
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      height: 42,
                      lineHeight: '40px',
                      fontWeight: 600,
                    }}
                  >
                    <ArrowDownOutlined style={{ marginRight: 6, color: '#059669' }} />
                    Stock In (Delivery / Inbound)
                  </Radio.Button>
                  <Radio.Button
                    value="STOCK_OUT"
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      height: 42,
                      lineHeight: '40px',
                      fontWeight: 600,
                    }}
                  >
                    <ArrowUpOutlined style={{ marginRight: 6, color: '#dc2626' }} />
                    Stock Out (Job Order / Dispatch)
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label={<Text strong>Select Target Equipment or Material</Text>}
                name="itemId"
                rules={[{ required: true, message: 'Please select an item to adjust!' }]}
              >
                <Select
                  size="large"
                  placeholder="Select inventory item by SKU or Name..."
                  showSearch
                  optionFilterProp="children"
                >
                  {items.map((item) => (
                    <Select.Option key={item.id} value={item.id}>
                      [{item.sku}] {item.name} — ({item.quantity} {item.unitOfMeasure || 'units'} available)
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <Text strong>
                        Quantity to {movementType === 'STOCK_IN' ? 'Receive' : 'Deduct'}
                      </Text>
                    }
                    name="quantity"
                    rules={[{ required: true, message: 'Please specify a quantity!' }]}
                  >
                    <InputNumber
                      size="large"
                      min={1}
                      style={{ width: '100%' }}
                      placeholder="e.g. 5"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<Text strong>Transaction Reason / Category</Text>}
                    name="reason"
                    rules={[{ required: true }]}
                  >
                    <Select size="large">
                      {movementType === 'STOCK_IN' ? (
                        <>
                          <Select.Option value="Supplier Delivery / Restock">Supplier Delivery / Restock</Select.Option>
                          <Select.Option value="Customer Return / Exchange">Customer Return / Exchange</Select.Option>
                          <Select.Option value="Warehouse Transfer In">Warehouse Transfer In</Select.Option>
                          <Select.Option value="Audit Correction (Surplus)">Audit Correction (Surplus)</Select.Option>
                          <Select.Option value="Other">Other Reason (Specify)</Select.Option>
                        </>
                      ) : (
                        <>
                          <Select.Option value="Client Installation / Site Project">Client Installation / Site Project</Select.Option>
                          <Select.Option value="Sales Order Outbound">Sales Order Outbound</Select.Option>
                          <Select.Option value="Damaged / Defective Write-off">Damaged / Defective Write-off</Select.Option>
                          <Select.Option value="Warehouse Transfer Out">Warehouse Transfer Out</Select.Option>
                          <Select.Option value="Other">Other Reason (Specify)</Select.Option>
                        </>
                      )}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                noStyle
                shouldUpdate={(prev, cur) => prev.reason !== cur.reason}
              >
                {({ getFieldValue }) =>
                  getFieldValue('reason') === 'Other' ? (
                    <Form.Item
                      label={<Text strong>Detailed Reason Notes</Text>}
                      name="customReason"
                      rules={[{ required: true, message: 'Please provide reason details!' }]}
                    >
                      <Input.TextArea rows={2} placeholder="Explain transaction rationale..." />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>

              <Form.Item style={{ marginTop: 12 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  danger={movementType === 'STOCK_OUT'}
                  style={{
                    height: 46,
                    fontWeight: 600,
                    borderRadius: 8,
                    backgroundColor: movementType === 'STOCK_IN' ? '#059669' : undefined,
                  }}
                >
                  Confirm & Post {movementType === 'STOCK_IN' ? 'Stock In (+)' : 'Stock Out (-)'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <CheckCircleOutlined style={{ color: '#2563eb' }} />
                <Text strong style={{ fontSize: 16 }}>
                  Live Impact Preview
                </Text>
              </Space>
            }
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
              height: '100%',
            }}
          >
            {!selectedItem ? (
              <div style={{ textAlign: 'center', padding: '48px 16px' }}>
                <InfoCircleOutlined style={{ fontSize: 40, color: '#94a3b8', marginBottom: 12 }} />
                <Paragraph type="secondary">
                  Select an item from the inventory list to view stock metrics, unit valuation, and post-transaction projection.
                </Paragraph>
              </div>
            ) : (
              <div>
                <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                  {selectedItem.name}
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  SKU: {selectedItem.sku} · {selectedItem.brand} · {selectedItem.itemType}
                </Text>

                <Divider style={{ margin: '16px 0' }} />

                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic
                      title="Current Warehouse Qty"
                      value={selectedItem.quantity}
                      suffix={selectedItem.unitOfMeasure || 'units'}
                      valueStyle={{ fontWeight: 700 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Unit Catalog Price"
                      value={formatMoney(selectedItem.listPrice)}
                      valueStyle={{ fontWeight: 600, fontSize: 18 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Adjustment Delta"
                      value={
                        previewQty
                          ? movementType === 'STOCK_IN'
                            ? `+${previewQty}`
                            : `-${previewQty}`
                          : '0'
                      }
                      suffix={selectedItem.unitOfMeasure || 'units'}
                      valueStyle={{
                        fontWeight: 700,
                        color: movementType === 'STOCK_IN' ? '#059669' : '#dc2626',
                      }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="New Stock Balance"
                      value={calculatedNewStock}
                      suffix={selectedItem.unitOfMeasure || 'units'}
                      valueStyle={{
                        fontWeight: 700,
                        color: calculatedNewStock <= (selectedItem.reorderLevel || 3) ? '#dc2626' : '#2563eb',
                      }}
                    />
                  </Col>
                </Row>

                <Alert
                  style={{ marginTop: 24, borderRadius: 8 }}
                  type="info"
                  showIcon
                  message="Audit & Ledger Notice"
                  description="Submitting this form immediately updates live inventory quantities in MongoDB and registers an entry into the Stock Movements Ledger."
                />
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
