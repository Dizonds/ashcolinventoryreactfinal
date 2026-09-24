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
  SearchOutlined,
  SaveOutlined,
  CheckOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { formatMoney } from '../utils/formatters';

const { Title, Text, Paragraph } = Typography;

export default function InventorySection({
  items,
  brands = [],
  user,
  onAddItem,
  onDeleteItem,
  onUpdateItem,
  onAddBrand,
  onNavigateToPostMovement,
  preselectedFilter,
}) {
  const isTechnician = user?.role === 'Technician';
  const [searchTerm, setSearchTerm] = useState('');
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
  const [inspectFormValues, setInspectFormValues] = useState({});
  const [editingField, setEditingField] = useState(null); // which field is currently in edit mode
  const [isSavingInspect, setIsSavingInspect] = useState(false);
  // Check if current form values actually differ from original inspectItem
  const isInspectDirty = React.useMemo(() => {
    if (!inspectItem) return false;
    const fields = [
      'name',
      'itemType',
      'category',
      'brand',
      'capacity',
      'unitOfMeasure',
      'quantity',
      'unitCost',
      'listPrice',
      'reorderLevel',
    ];
    return fields.some((f) => {
      const orig = inspectItem[f] ?? '';
      const curr = inspectFormValues[f] ?? '';
      return String(orig) !== String(curr);
    });
  }, [inspectItem, inspectFormValues]);

  // When opening inspect item modal, initialize editable values
  const handleOpenInspect = (record) => {
    setInspectItem(record);
    setInspectFormValues({ ...record });
    setEditingField(null);
  };

  const handleInspectFieldChange = (field, value) => {
    setInspectFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveInspect = async () => {
    if (!onUpdateItem || !inspectItem) return;
    setIsSavingInspect(true);
    try {
      const newQty = Number(inspectFormValues.quantity ?? inspectItem.quantity) || 0;
      const oldQty = Number(inspectItem.quantity) || 0;
      const delta = newQty - oldQty;

      const updated = {
        ...inspectItem,
        ...inspectFormValues,
        quantity: newQty,
        unitCost: Number(inspectFormValues.unitCost) || 0,
        listPrice: Number(inspectFormValues.listPrice) || 0,
        reorderLevel: Number(inspectFormValues.reorderLevel) || 0,
        stockEditReason:
          delta !== 0
            ? `Manual Adjustment in Specs (${delta > 0 ? '+' : ''}${delta})`
            : undefined,
      };
      await onUpdateItem(updated);
      setInspectItem(updated);
      setInspectFormValues({ ...updated });
      setEditingField(null);
    } catch (e) {
      // Error handled in App.js
    } finally {
      setIsSavingInspect(false);
    }
  };

  // Form for item creation
  const [form] = Form.useForm();
  const [itemTypeWatch, setItemTypeWatch] = useState('AC Unit');

  const handleOpenAddModal = () => {
    form.resetFields();
    form.setFieldsValue({
      itemType: 'AC Unit',
    });
    setItemTypeWatch('AC Unit');
    setIsAddModalOpen(true);
  };

  const handleTypeSwitch = (newType) => {
    setItemTypeWatch(newType);
    form.setFieldsValue({
      itemType: newType,
      category: undefined,
    });
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
      width: isTechnician ? 90 : 140,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleOpenInspect(record)}
            style={{ color: '#2563eb' }}
          >
            Specs
          </Button>
          {!isTechnician && (
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
          )}
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
              type={isTechnician ? 'primary' : 'default'}
              icon={<SwapOutlined />}
              onClick={onNavigateToPostMovement}
              style={{
                fontWeight: 600,
                backgroundColor: isTechnician ? '#2563eb' : undefined,
              }}
            >
              Post Stock Movement
            </Button>
          )}
          {!isTechnician && (
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
          )}
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

          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8', marginRight: 4 }} />}
            placeholder="Search SKU, model, or part name..."
            allowClear
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 260, borderRadius: 8 }}
          />

          <Select
            value={selectedType}
            onChange={(val) => {
              setSelectedType(val);
              setSelectedCategory('');
            }}
            style={{ width: 170 }}
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

          {(searchTerm !== '' || selectedType !== 'ALL' || selectedCategory !== '' || selectedBrandFilter !== '') && (
            <Button
              type="dashed"
              icon={<ClearOutlined />}
              onClick={() => {
                setSearchTerm('');
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
            <Tag color="cyan" style={{ fontSize: 11, marginLeft: 6 }}>
              💡 Double-click any field to edit
            </Tag>
          </Space>
        }
        centered
        open={Boolean(inspectItem)}
        onCancel={() => {
          setInspectItem(null);
          setEditingField(null);
          setInspectFormValues({});
        }}
        footer={[
          isInspectDirty && (
            <Button
              key="save"
              type="primary"
              icon={<SaveOutlined />}
              loading={isSavingInspect}
              onClick={handleSaveInspect}
              style={{
                backgroundColor: '#059669',
                borderColor: '#059669',
              }}
            >
              Save
            </Button>
          ),
          <Button
            key="close"
            onClick={() => {
              setInspectItem(null);
              setEditingField(null);
              setInspectFormValues({});
            }}
          >
            Done
          </Button>,
        ].filter(Boolean)}
        width={660}
      >
        {inspectItem && (
          <div>
            <div
              style={{
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 4,
                transition: 'background 0.2s',
              }}
              onDoubleClick={() => setEditingField('name')}
              title="Double click to edit Item Name"
            >
              {editingField === 'name' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' }}>
                  <Input
                    size="small"
                    value={inspectFormValues.name}
                    autoFocus
                    onChange={(e) => handleInspectFieldChange('name', e.target.value)}
                    onPressEnter={() => setEditingField(null)}
                    onBlur={() => setEditingField(null)}
                    style={{ fontWeight: 600, fontSize: 15 }}
                  />
                  <Button
                    size="small"
                    type="text"
                    icon={<CheckOutlined style={{ color: '#059669' }} />}
                    onClick={() => setEditingField(null)}
                  />
                </div>
              ) : (
                <Title
                  level={4}
                  style={{
                    margin: '6px 0 2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{inspectFormValues.name}</span>
                  <EditOutlined style={{ fontSize: 13, color: '#94a3b8' }} />
                </Title>
              )}
            </div>

            <Text type="secondary" style={{ fontSize: 13, paddingLeft: 8 }}>
              SKU: {inspectItem.sku}
            </Text>

            <Divider style={{ margin: '14px 0' }} />

            <Descriptions
              bordered
              size="small"
              column={2}
              style={{ tableLayout: 'fixed', width: '100%' }}
              labelStyle={{ width: '28%', verticalAlign: 'middle', whiteSpace: 'nowrap' }}
              contentStyle={{ width: '22%', minHeight: 46, height: 46, verticalAlign: 'middle' }}
            >
              {/* Type */}
              <Descriptions.Item
                label="Type"
                span={1}
              >
                <div
                  onDoubleClick={() => setEditingField('itemType')}
                  style={{ cursor: 'pointer', width: '100%', minHeight: 24, display: 'flex', alignItems: 'center' }}
                  title="Double click to edit Type"
                >
                  {editingField === 'itemType' ? (
                    <Select
                      size="small"
                      style={{ width: '100%' }}
                      value={inspectFormValues.itemType}
                      autoFocus
                      defaultOpen
                      onChange={(val) => {
                        handleInspectFieldChange('itemType', val);
                        setEditingField(null);
                      }}
                      onBlur={() => setEditingField(null)}
                      options={[
                        { value: 'AC Unit', label: 'AC Unit' },
                        { value: 'Material / Part', label: 'Material / Part' },
                      ]}
                    />
                  ) : (
                    <Space size={4}>
                      <Tag color={inspectFormValues.itemType === 'AC Unit' ? 'blue' : 'orange'}>
                        {inspectFormValues.itemType}
                      </Tag>
                      <EditOutlined style={{ fontSize: 11, color: '#94a3b8' }} />
                    </Space>
                  )}
                </div>
              </Descriptions.Item>

              {/* Category */}
              <Descriptions.Item label="Category" span={1}>
                <div
                  onDoubleClick={() => setEditingField('category')}
                  style={{ cursor: 'pointer', width: '100%', minHeight: 24, display: 'flex', alignItems: 'center' }}
                  title="Double click to edit Category"
                >
                  {editingField === 'category' ? (
                    <Select
                      size="small"
                      style={{ width: '100%' }}
                      value={inspectFormValues.category}
                      autoFocus
                      defaultOpen
                      onChange={(val) => {
                        handleInspectFieldChange('category', val);
                        setEditingField(null);
                      }}
                      onBlur={() => setEditingField(null)}
                    >
                      {inspectFormValues.itemType === 'AC Unit' ? (
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
                  ) : (
                    <Space size={4}>
                      <span>{inspectFormValues.category || '—'}</span>
                      <EditOutlined style={{ fontSize: 11, color: '#94a3b8' }} />
                    </Space>
                  )}
                </div>
              </Descriptions.Item>

              {/* Brand */}
              <Descriptions.Item label="Brand" span={1}>
                <div
                  onDoubleClick={() => setEditingField('brand')}
                  style={{ cursor: 'pointer', width: '100%', minHeight: 24, display: 'flex', alignItems: 'center' }}
                  title="Double click to edit Brand"
                >
                  {editingField === 'brand' ? (
                    <Select
                      size="small"
                      showSearch
                      allowClear
                      style={{ width: '100%' }}
                      value={inspectFormValues.brand}
                      autoFocus
                      defaultOpen
                      onChange={(val) => {
                        handleInspectFieldChange('brand', val);
                        setEditingField(null);
                      }}
                      onBlur={() => setEditingField(null)}
                      options={brands.map((b) => ({ value: b.name, label: b.name }))}
                    />
                  ) : (
                    <Space size={4}>
                      <span>{inspectFormValues.brand || '—'}</span>
                      <EditOutlined style={{ fontSize: 11, color: '#94a3b8' }} />
                    </Space>
                  )}
                </div>
              </Descriptions.Item>

              {/* Specs / Capacity */}
              <Descriptions.Item label="Specs / Capacity" span={1}>
                <div
                  onDoubleClick={() => setEditingField('capacity')}
                  style={{ cursor: 'pointer', width: '100%', minHeight: 24, display: 'flex', alignItems: 'center' }}
                  title="Double click to edit Specs"
                >
                  {editingField === 'capacity' ? (
                    <Input
                      size="small"
                      value={inspectFormValues.capacity}
                      autoFocus
                      onChange={(e) => handleInspectFieldChange('capacity', e.target.value)}
                      onPressEnter={() => setEditingField(null)}
                      onBlur={() => setEditingField(null)}
                    />
                  ) : (
                    <Space size={4}>
                      <span>{inspectFormValues.capacity || '—'}</span>
                      <EditOutlined style={{ fontSize: 11, color: '#94a3b8' }} />
                    </Space>
                  )}
                </div>
              </Descriptions.Item>

              {/* Unit of Measure */}
              <Descriptions.Item label="Unit of Measure" span={1}>
                <div
                  onDoubleClick={() => setEditingField('unitOfMeasure')}
                  style={{ cursor: 'pointer', width: '100%', minHeight: 24, display: 'flex', alignItems: 'center' }}
                  title="Double click to edit Unit of Measure"
                >
                  {editingField === 'unitOfMeasure' ? (
                    <Input
                      size="small"
                      value={inspectFormValues.unitOfMeasure}
                      autoFocus
                      onChange={(e) => handleInspectFieldChange('unitOfMeasure', e.target.value)}
                      onPressEnter={() => setEditingField(null)}
                      onBlur={() => setEditingField(null)}
                    />
                  ) : (
                    <Space size={4}>
                      <span>{inspectFormValues.unitOfMeasure || 'UNIT'}</span>
                      <EditOutlined style={{ fontSize: 11, color: '#94a3b8' }} />
                    </Space>
                  )}
                </div>
              </Descriptions.Item>

              {/* Current Stock */}
              <Descriptions.Item label="Current Stock" span={1}>
                <div
                  onDoubleClick={() => setEditingField('quantity')}
                  style={{ cursor: 'pointer', width: '100%', minHeight: 24, display: 'flex', alignItems: 'center' }}
                  title="Double click to edit Current Stock count"
                >
                  {editingField === 'quantity' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
                      <InputNumber
                        size="small"
                        min={0}
                        style={{ width: 100 }}
                        value={inspectFormValues.quantity ?? inspectItem.quantity}
                        autoFocus
                        onChange={(val) => handleInspectFieldChange('quantity', val)}
                        onPressEnter={() => setEditingField(null)}
                        onBlur={() => setEditingField(null)}
                      />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {inspectFormValues.unitOfMeasure || 'UNIT'}
                      </Text>
                    </div>
                  ) : (
                    <Space size={6} align="center">
                      <Text
                        strong
                        style={{
                          fontSize: 14,
                          color:
                            (inspectFormValues.quantity ?? inspectItem.quantity) <= (inspectFormValues.reorderLevel || 3)
                              ? '#dc2626'
                              : '#059669',
                        }}
                      >
                        {inspectFormValues.quantity ?? inspectItem.quantity}{' '}
                        {inspectFormValues.unitOfMeasure || 'UNIT'}
                      </Text>
                      {inspectFormValues.quantity !== undefined &&
                        inspectFormValues.quantity !== inspectItem.quantity && (
                          <Tag
                            color={
                              inspectFormValues.quantity > inspectItem.quantity
                                ? 'green'
                                : 'volcano'
                            }
                            style={{ fontSize: 11, padding: '0 4px', margin: 0 }}
                          >
                            {inspectFormValues.quantity > inspectItem.quantity ? '+' : ''}
                            {inspectFormValues.quantity - inspectItem.quantity}
                          </Tag>
                        )}
                      <EditOutlined style={{ fontSize: 11, color: '#94a3b8' }} />
                    </Space>
                  )}
                </div>
              </Descriptions.Item>

              {/* Cost Price */}
              <Descriptions.Item label="Cost Price" span={1}>
                <div
                  onDoubleClick={() => setEditingField('unitCost')}
                  style={{ cursor: 'pointer', width: '100%', minHeight: 24, display: 'flex', alignItems: 'center' }}
                  title="Double click to edit Cost Price"
                >
                  {editingField === 'unitCost' ? (
                    <InputNumber
                      size="small"
                      min={0}
                      style={{ width: '100%' }}
                      value={inspectFormValues.unitCost}
                      autoFocus
                      onChange={(val) => handleInspectFieldChange('unitCost', val)}
                      onPressEnter={() => setEditingField(null)}
                      onBlur={() => setEditingField(null)}
                    />
                  ) : (
                    <Space size={4}>
                      <span>{formatMoney(inspectFormValues.unitCost)}</span>
                      <EditOutlined style={{ fontSize: 11, color: '#94a3b8' }} />
                    </Space>
                  )}
                </div>
              </Descriptions.Item>

              {/* Selling Price */}
              <Descriptions.Item label="Selling Price" span={1}>
                <div
                  onDoubleClick={() => setEditingField('listPrice')}
                  style={{ cursor: 'pointer', width: '100%', minHeight: 24, display: 'flex', alignItems: 'center' }}
                  title="Double click to edit Selling Price"
                >
                  {editingField === 'listPrice' ? (
                    <InputNumber
                      size="small"
                      min={0}
                      style={{ width: '100%' }}
                      value={inspectFormValues.listPrice}
                      autoFocus
                      onChange={(val) => handleInspectFieldChange('listPrice', val)}
                      onPressEnter={() => setEditingField(null)}
                      onBlur={() => setEditingField(null)}
                    />
                  ) : (
                    <Space size={4}>
                      <Text strong>{formatMoney(inspectFormValues.listPrice)}</Text>
                      <EditOutlined style={{ fontSize: 11, color: '#94a3b8' }} />
                    </Space>
                  )}
                </div>
              </Descriptions.Item>

              {/* Safety Min Level */}
              <Descriptions.Item label="Safety Min Level" span={1}>
                <div
                  onDoubleClick={() => setEditingField('reorderLevel')}
                  style={{ cursor: 'pointer', width: '100%', minHeight: 24, display: 'flex', alignItems: 'center' }}
                  title="Double click to edit Safety Min Level"
                >
                  {editingField === 'reorderLevel' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
                      <InputNumber
                        size="small"
                        min={0}
                        style={{ width: 100 }}
                        value={inspectFormValues.reorderLevel}
                        autoFocus
                        onChange={(val) => handleInspectFieldChange('reorderLevel', val)}
                        onPressEnter={() => setEditingField(null)}
                        onBlur={() => setEditingField(null)}
                      />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        units
                      </Text>
                    </div>
                  ) : (
                    <Space size={4}>
                      <span>{inspectFormValues.reorderLevel || 3} units</span>
                      <EditOutlined style={{ fontSize: 11, color: '#94a3b8' }} />
                    </Space>
                  )}
                </div>
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
        centered
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
                rules={[{ required: true, message: 'Please select a category!' }]}
              >
                <Select placeholder="Select category">
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
                  allowClear
                  placeholder="Brand"
                  options={brands.map((b) => ({ value: b.name, label: b.name }))}
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
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0.00" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<Text strong>Retail Selling Price (₱)</Text>} name="listPrice">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0.00" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={<Text strong>Initial Stock Qty</Text>} name="quantity">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<Text strong>Reorder Alert Level</Text>} name="reorderLevel">
                <InputNumber style={{ width: '100%' }} min={1} placeholder="3" />
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
