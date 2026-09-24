import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Select,
  Modal,
  Form,
  Input,
  InputNumber,
  Row,
  Col,
  Typography,
  Popconfirm,
  Descriptions,
  Badge,
  Empty,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  SwapOutlined,
  EyeOutlined,
  DeleteOutlined,
  FilterOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { formatMoney } from '../utils/formatters';

const { Title, Text, Paragraph } = Typography;

export default function InventorySection({
  items,
  brands = [],
  onAddItem,
  onDeleteItem,
  onAddBrand,
  searchTerm,
  onNavigateToPostMovement,
  preselectedFilter,
}) {
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('');

  // Sync when preselectedFilter changes from dashboard cards
  React.useEffect(() => {
    if (preselectedFilter) {
      if (preselectedFilter.itemType) {
        setSelectedType(preselectedFilter.itemType);
      }
      if (preselectedFilter.category) {
        setSelectedCategory(preselectedFilter.category);
      } else {
        setSelectedCategory('');
      }
      setSelectedBrandFilter('');
    }
  }, [preselectedFilter]);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inspectItem, setInspectItem] = useState(null);

  // Form for item creation
  const [form] = Form.useForm();
  const [itemTypeWatch, setItemTypeWatch] = useState('AC Unit');

  const handleOpenAddModal = () => {
    form.resetFields();
    form.setFieldsValue({
      itemType: 'AC Unit',
      category: 'Split Type',
      capacity: '1.0 HP',
      unitOfMeasure: 'UNIT',
      brand: 'Carrier',
      unitCost: 18000,
      listPrice: 24000,
      quantity: 10,
      reorderLevel: 3,
    });
    setItemTypeWatch('AC Unit');
    setIsAddModalOpen(true);
  };

  const handleTypeSwitch = (newType) => {
    setItemTypeWatch(newType);
    if (newType === 'AC Unit') {
      form.setFieldsValue({
        itemType: 'AC Unit',
        category: 'Split Type',
        unitOfMeasure: 'UNIT',
        capacity: '1.0 HP',
        brand: 'Carrier',
        unitCost: 18000,
        listPrice: 24000,
      });
    } else {
      form.setFieldsValue({
        itemType: 'Material / Part',
        category: 'Compressors',
        unitOfMeasure: 'PCS',
        capacity: '11.3 kg',
        brand: 'Generic Parts',
        unitCost: 3500,
        listPrice: 5000,
      });
    }
  };

  const handleFormFinish = (values) => {
    const cleanBrand = (values.brand || '').trim();
    if (!cleanBrand) return;

    // Check if brand exists in brands list
    const brandExists = brands.some(
      (b) => b.name.toLowerCase() === cleanBrand.toLowerCase()
    );
    if (!brandExists) {
      onAddBrand(cleanBrand);
    }

    const newItem = {
      sku: values.sku,
      name: values.name,
      category: values.category,
      itemType: values.itemType,
      brand: cleanBrand,
      capacity: values.capacity,
      unitOfMeasure: values.unitOfMeasure,
      unitCost: Number(values.unitCost) || 0,
      listPrice: Number(values.listPrice) || 0,
      quantity: Number(values.quantity) || 0,
      reorderLevel: Number(values.reorderLevel) || 3,
    };

    onAddItem(newItem);
    setIsAddModalOpen(false);
  };

  // Filtering
  const filteredItems = items
    .filter((item) => selectedType === 'ALL' || item.itemType === selectedType)
    .filter((item) => selectedCategory === '' || item.category === selectedCategory)
    .filter(
      (item) =>
        selectedBrandFilter === '' ||
        (item.brand && item.brand.toLowerCase() === selectedBrandFilter.toLowerCase())
    )
    .filter((item) => {
      const term = (searchTerm || '').toLowerCase();
      if (!term) return true;
      const { name = '', sku = '', brand = '' } = item;
      return (
        name.toLowerCase().includes(term) ||
        sku.toLowerCase().includes(term) ||
        brand.toLowerCase().includes(term)
      );
    });

  const columns = [
    {
      title: 'SKU / Model',
      dataIndex: 'sku',
      key: 'sku',
      width: 140,
      render: (sku) => (
        <Text code strong style={{ fontSize: 13 }}>
          {sku}
        </Text>
      ),
    },
    {
      title: 'Item Name & Specs',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <Text strong style={{ fontSize: 14 }}>{name}</Text>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
            {record.capacity ? <span>Spec: {record.capacity} · </span> : null}
            <span>UOM: {record.unitOfMeasure || 'UNIT'}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'itemType',
      key: 'itemType',
      width: 140,
      render: (type) => (
        <Tag color={type === 'AC Unit' ? 'blue' : 'orange'} style={{ fontWeight: 600 }}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
      width: 130,
      render: (b) => <Tag color="default">{b || 'Generic'}</Tag>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 140,
      render: (cat) => <Text style={{ fontSize: 13 }}>{cat}</Text>,
    },
    {
      title: 'Retail Price',
      dataIndex: 'listPrice',
      key: 'listPrice',
      width: 130,
      render: (price) => <Text strong>{formatMoney(price)}</Text>,
    },
    {
      title: 'Stock Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (qty, record) => {
        const isLow = qty <= (record.reorderLevel || 3);
        return (
          <Badge
            count={qty}
            overflowCount={9999}
            style={{
              backgroundColor: isLow ? '#ef4444' : '#10b981',
              fontWeight: 700,
              fontSize: 13,
              boxShadow: 'none',
              padding: '0 8px',
            }}
          />
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setInspectItem(record)}
            style={{ color: '#2563eb' }}
          >
            Specs
          </Button>
          <Popconfirm
            title="Delete Inventory Item"
            description={`Are you sure you want to delete ${record.sku}?`}
            onConfirm={() => onDeleteItem(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.3px' }}>
            AC Equipment & Spare Parts Inventory
          </Title>
          <Paragraph type="secondary" style={{ margin: '4px 0 0', fontSize: 14 }}>
            Unified catalog for air conditioning units, compressors, freon refrigerants, and installation materials.
          </Paragraph>
        </div>

        <Space wrap>
          {onNavigateToPostMovement && (
            <Button
              icon={<SwapOutlined />}
              onClick={onNavigateToPostMovement}
              style={{ fontWeight: 600 }}
            >
              Post Stock Movement
            </Button>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenAddModal}
            style={{
              backgroundColor: '#059669',
              fontWeight: 600,
              borderRadius: 8,
            }}
          >
            Register New Item
          </Button>
        </Space>
      </div>

      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Filters Toolbar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FilterOutlined style={{ color: '#64748b' }} />
            <Text type="secondary" strong style={{ fontSize: 12, textTransform: 'uppercase' }}>
              Filters:
            </Text>
          </div>

          <Select
            value={selectedType}
            onChange={(val) => {
              setSelectedType(val);
              setSelectedCategory('');
            }}
            style={{ width: 190 }}
          >
            <Select.Option value="ALL">All Item Types</Select.Option>
            <Select.Option value="AC Unit">AC Units</Select.Option>
            <Select.Option value="Material / Part">Parts & Supplies</Select.Option>
          </Select>

          <Select
            value={selectedBrandFilter}
            onChange={(val) => setSelectedBrandFilter(val)}
            style={{ width: 170 }}
            placeholder="All Brands"
          >
            <Select.Option value="">All Brands</Select.Option>
            {brands.map((b) => (
              <Select.Option key={b.id || b.name} value={b.name}>
                {b.name}
              </Select.Option>
            ))}
          </Select>

          <Select
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            style={{ width: 190 }}
            placeholder="All Categories"
          >
            <Select.Option value="">All Categories</Select.Option>
            {selectedType !== 'Material / Part' && (
              <Select.OptGroup label="AC Units">
                <Select.Option value="Split Type">Split Type</Select.Option>
                <Select.Option value="Window Type">Window Type</Select.Option>
                <Select.Option value="Floor Mounted">Floor Mounted</Select.Option>
                <Select.Option value="Portable">Portable AC</Select.Option>
              </Select.OptGroup>
            )}
            {selectedType !== 'AC Unit' && (
              <Select.OptGroup label="Parts & Supplies">
                <Select.Option value="Compressors">Compressors</Select.Option>
                <Select.Option value="Refrigerants">Refrigerants (Freon)</Select.Option>
                <Select.Option value="Installation Materials">Installation Materials</Select.Option>
                <Select.Option value="Copper Tubing">Copper Tubing</Select.Option>
              </Select.OptGroup>
            )}
          </Select>

          {(selectedType !== 'ALL' || selectedCategory !== '' || selectedBrandFilter !== '') && (
            <Button
              type="dashed"
              icon={<ClearOutlined />}
              onClick={() => {
                setSelectedType('ALL');
                setSelectedCategory('');
                setSelectedBrandFilter('');
              }}
            >
              Reset
            </Button>
          )}

          <div style={{ marginLeft: 'auto' }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Showing <Text strong>{filteredItems.length}</Text> items
            </Text>
          </div>
        </div>

        {/* Ant Design Data Table */}
        <Table
          dataSource={filteredItems}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No inventory items match the current search or filters."
              />
            ),
          }}
        />
      </Card>

      {/* Modal: Item Specifications View */}
      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color: '#2563eb' }} />
            <Text strong>Item Specifications</Text>
          </Space>
        }
        open={Boolean(inspectItem)}
        onCancel={() => setInspectItem(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setInspectItem(null)}>
            Done
          </Button>,
        ]}
        width={600}
      >
        {inspectItem && (
          <div>
            <Title level={4} style={{ margin: '8px 0 2px' }}>
              {inspectItem.name}
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              SKU: {inspectItem.sku}
            </Text>

            <Divider style={{ margin: '16px 0' }} />

            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Type">
                <Tag color={inspectItem.itemType === 'AC Unit' ? 'blue' : 'orange'}>
                  {inspectItem.itemType}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Category">{inspectItem.category}</Descriptions.Item>
              <Descriptions.Item label="Brand">{inspectItem.brand}</Descriptions.Item>
              <Descriptions.Item label="Specs / Capacity">
                {inspectItem.capacity || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Unit of Measure">
                {inspectItem.unitOfMeasure || 'UNIT'}
              </Descriptions.Item>
              <Descriptions.Item label="Current Stock">
                <Text
                  strong
                  style={{
                    color:
                      inspectItem.quantity <= (inspectItem.reorderLevel || 3) ? '#dc2626' : '#059669',
                  }}
                >
                  {inspectItem.quantity} {inspectItem.unitOfMeasure}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Cost Price">
                {formatMoney(inspectItem.unitCost)}
              </Descriptions.Item>
              <Descriptions.Item label="Selling Price">
                <Text strong>{formatMoney(inspectItem.listPrice)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Safety Min Level">
                {inspectItem.reorderLevel || 3} units
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Modal: Register New Item */}
      <Modal
        title={
          <Space>
            <PlusOutlined style={{ color: '#059669' }} />
            <Text strong>Register New Inventory Item</Text>
          </Space>
        }
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        width={640}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormFinish}
          style={{ marginTop: 16 }}
        >
          <Form.Item label={<Text strong>Classification</Text>} name="itemType">
            <Select
              onChange={handleTypeSwitch}
              options={[
                { value: 'AC Unit', label: 'AC Unit (Complete System)' },
                { value: 'Material / Part', label: 'Spare Part / Refrigerant' },
              ]}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<Text strong>SKU / Model Code</Text>}
                name="sku"
                rules={[{ required: true, message: 'Please provide SKU or model number!' }]}
              >
                <Input placeholder="e.g. CAR-1.5HP-INV" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<Text strong>Item Description / Name</Text>}
                name="name"
                rules={[{ required: true, message: 'Please enter item name!' }]}
              >
                <Input placeholder="e.g. Carrier Inverter 1.5 HP Split" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<Text strong>Category</Text>}
                name="category"
                rules={[{ required: true }]}
              >
                <Select>
                  {itemTypeWatch === 'AC Unit' ? (
                    <>
                      <Select.Option value="Split Type">Split Type</Select.Option>
                      <Select.Option value="Window Type">Window Type</Select.Option>
                      <Select.Option value="Floor Mounted">Floor Mounted</Select.Option>
                      <Select.Option value="Portable">Portable AC</Select.Option>
                    </>
                  ) : (
                    <>
                      <Select.Option value="Compressors">Compressors</Select.Option>
                      <Select.Option value="Refrigerants">Refrigerants (Freon)</Select.Option>
                      <Select.Option value="Installation Materials">Installation Materials</Select.Option>
                      <Select.Option value="Copper Tubing">Copper Tubing</Select.Option>
                    </>
                  )}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={<Text strong>Brand (Select or Type New)</Text>}
                name="brand"
                rules={[{ required: true, message: 'Please specify a brand!' }]}
              >
                <Select
                  showSearch
                  placeholder="Select or enter brand"
                  options={brands.map((b) => ({ value: b.name, label: b.name }))}
                  dropdownRender={(menu) => (
                    <div>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <div style={{ padding: '0 8px 4px', fontSize: 12, color: '#64748b' }}>
                        💡 New brands are automatically registered to MongoDB.
                      </div>
                    </div>
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={<Text strong>Capacity / Rating</Text>} name="capacity">
                <Input placeholder="e.g. 1.0 HP, 11.3 kg, 15m" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<Text strong>Unit of Measure (UOM)</Text>} name="unitOfMeasure">
                <Input placeholder="UNIT, PCS, ROLL, CAN" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={<Text strong>Cost Price (₱)</Text>} name="unitCost">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<Text strong>Retail Selling Price (₱)</Text>} name="listPrice">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={<Text strong>Initial Stock Qty</Text>} name="quantity">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<Text strong>Reorder Alert Level</Text>} name="reorderLevel">
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 16, marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{ backgroundColor: '#059669', borderRadius: 6 }}
              >
                Save Item to Inventory
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
