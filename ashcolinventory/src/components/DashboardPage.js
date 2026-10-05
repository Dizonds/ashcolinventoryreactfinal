import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Typography,
  Space,
  Empty,
  Radio,
  theme,
} from 'antd';
import {
  AppstoreOutlined,
  ToolOutlined,
  AlertOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  AppstoreAddOutlined,
  PieChartOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { formatMoney } from '../utils/formatters';

const { Title, Text, Paragraph } = Typography;

// Snappy Animated Counter component for numbers and currency (fast ~280ms count)
function AnimatedCounter({ endValue, duration = 280, isCurrency = false, triggerAnimation = true }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!triggerAnimation) {
      setDisplayValue(0);
      return;
    }

    const end = Number(endValue) || 0;
    if (end === 0) {
      setDisplayValue(0);
      return;
    }

    let startTime = null;
    let animFrameId = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Fast ease-out quad for quick snap to number
      const easeProgress = 1 - Math.pow(1 - progress, 2);
      const current = Math.round(easeProgress * end);
      setDisplayValue(current);

      if (progress < 1) {
        animFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
      }
    };

    animFrameId = requestAnimationFrame(animate);
    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [endValue, duration, triggerAnimation]);

  if (isCurrency) {
    return <span>{formatMoney(displayValue)}</span>;
  }
  return <span>{displayValue.toLocaleString()}</span>;
}

// Animated Circular Donut Meter Component (Horizontal Row Layout)
function AnimatedDonutCard({
  title,
  subtitle,
  icon,
  color,
  percentage,
  centerPrimary,
  centerSecondary,
  breakdown = [],
  triggerAnimation,
  token,
  onClick,
}) {
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    if (triggerAnimation) {
      setAnimProgress(0);
      const timer = setTimeout(() => {
        setAnimProgress(Math.min(100, Math.max(0, percentage)));
      }, 60);
      return () => clearTimeout(timer);
    } else {
      setAnimProgress(0);
    }
  }, [triggerAnimation, percentage]);

  // Radius = 40, Circumference = 2 * PI * 40 ≈ 251.327
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * animProgress) / 100;

  return (
    <Card
      bordered={false}
      hoverable={Boolean(onClick)}
      style={{
        borderRadius: 14,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        border: `1px solid ${token.colorBorderSecondary}`,
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.25s',
      }}
      onClick={onClick}
      bodyStyle={{
        padding: '16px 20px',
      }}
    >
      {/* 1. Small Title & Subtitle at Left Top */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <Space size="small">
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              backgroundColor: `${color}15`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
            }}
          >
            {icon}
          </div>
          <Text strong style={{ fontSize: 13, color: token.colorTextSecondary, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            {title}
          </Text>
          <span style={{ fontSize: 12, color: token.colorTextTertiary }}>•</span>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {subtitle}
          </Text>
        </Space>

        <Space size="small">
          {onClick && (
            <Tag color="blue" style={{ fontSize: 10, margin: 0, borderRadius: 4 }}>
              Filter Catalog →
            </Tag>
          )}
          <Tag color="default" style={{ margin: 0, fontWeight: 700, borderRadius: 4, fontSize: 11 }}>
            {percentage}% of inventory
          </Tag>
        </Space>
      </div>

      {/* 2. Main Body: Pie Chart on the Side (Left), Breakdown & Details on Right */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        {/* Pie Chart positioned on the Side */}
        <div style={{ flexShrink: 0, position: 'relative', width: 95, height: 95 }}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={token.colorFillAlter}
              strokeWidth="12"
            />
            {/* Animated progress ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={color}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 1.1s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />
          </svg>

          {/* Center Info inside Ring */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              maxWidth: 70,
            }}
          >
            <div
              style={{
                fontSize: typeof centerPrimary === 'string' && centerPrimary.length > 8 ? 10.5 : 13,
                fontWeight: 800,
                color: token.colorText,
                lineHeight: 1.1,
              }}
            >
              {centerPrimary}
            </div>
            {centerSecondary && (
              <div
                style={{
                  fontSize: 8,
                  color: token.colorTextSecondary,
                  marginTop: 1,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                {centerSecondary}
              </div>
            )}
          </div>
        </div>

        {/* Breakdown Stats next to the Pie Chart */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            flex: 1,
            minWidth: 260,
          }}
        >
          {breakdown.map((item, idx) => (
            <div
              key={idx}
              onClick={(e) => {
                if (item.onClick) {
                  e.stopPropagation();
                  item.onClick();
                }
              }}
              style={{
                flex: 1,
                minWidth: 120,
                padding: '8px 14px',
                borderRadius: 8,
                background: token.colorFillAlter,
                border: `1px solid ${token.colorBorderSecondary}`,
                cursor: item.onClick ? 'pointer' : 'default',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (item.onClick) {
                  e.currentTarget.style.borderColor = item.color || '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (item.onClick) {
                  e.currentTarget.style.borderColor = token.colorBorderSecondary;
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                {item.label}
              </Text>
              <Text strong style={{ color: item.color || token.colorText, fontSize: 14 }}>
                {item.value}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage({
  items,
  movements,
  onRestockItem,
  onNavigateToInventoryWithFilter,
}) {
  const { token } = theme.useToken();
  const [metricViewMode, setMetricViewMode] = useState(() => {
    return localStorage.getItem('ashcol_dashboard_view') || 'cards';
  });
  const [chartAnimTrigger, setChartAnimTrigger] = useState(false);
  const [barAnimTrigger, setBarAnimTrigger] = useState(false);
  const [cardAnimTrigger, setCardAnimTrigger] = useState(false);

  // Save selection to localStorage
  const handleViewModeChange = (mode) => {
    setMetricViewMode(mode);
    localStorage.setItem('ashcol_dashboard_view', mode);
  };

  // Trigger smooth load-in animation when entering the pie chart tab
  useEffect(() => {
    if (metricViewMode === 'pie') {
      setChartAnimTrigger(false);
      const timer = setTimeout(() => {
        setChartAnimTrigger(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [metricViewMode]);

  // Trigger smooth rising animation when entering the bar chart tab or when loaded
  useEffect(() => {
    if (metricViewMode === 'bar') {
      setBarAnimTrigger(false);
      const timer = setTimeout(() => {
        setBarAnimTrigger(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setBarAnimTrigger(false);
    }
  }, [metricViewMode]);

  // Trigger smooth counting animation when entering default cards view
  useEffect(() => {
    if (metricViewMode === 'cards') {
      setCardAnimTrigger(false);
      const timer = setTimeout(() => {
        setCardAnimTrigger(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setCardAnimTrigger(false);
    }
  }, [metricViewMode]);

  const acUnits = items.filter(({ itemType }) => itemType === 'AC Unit');
  const materials = items.filter(({ itemType }) => itemType !== 'AC Unit');
  const lowStockItems = items.filter(({ quantity, reorderLevel }) => quantity <= (reorderLevel || 3));

  const totalValuation = items.reduce((acc, { listPrice, quantity }) => {
    return acc + (Number(listPrice) || 0) * (Number(quantity) || 0);
  }, 0);

  const totalPhysicalUnits = items.reduce((acc, { quantity }) => acc + (Number(quantity) || 0), 0);
  const totalCatalogModels = items.length || 1;

  // Breakdown calculations for the 4 individual pie charts:
  // 1. AC Units in Stock
  const acSplitCount = acUnits.filter((i) => i.category === 'Split Type').length;
  const acWindowCount = acUnits.filter((i) => i.category === 'Window Type').length;
  const acFloorCount = acUnits.filter((i) => i.category === 'Floor Mounted').length;
  const acPortableCount = acUnits.filter((i) => i.category === 'Portable').length;
  const acUnitsPct = Math.round((acUnits.length / totalCatalogModels) * 100);

  // 2. Parts & Freon Refrigerants
  const compressorsCount = materials.filter((i) => i.category === 'Compressors').length;
  const refrigerantsCount = materials.filter((i) => i.category === 'Refrigerants').length;
  const installMatCount = materials.filter((i) => i.category === 'Installation Materials').length;
  const partsPct = Math.round((materials.length / totalCatalogModels) * 100);

  // 3. Restock Warnings
  const zeroStockCount = lowStockItems.filter((i) => (Number(i.quantity) || 0) === 0).length;
  const lowStockPct = Math.round((lowStockItems.length / totalCatalogModels) * 100);

  // 4. Total Warehouse Valuation (comparing AC unit stock value vs parts stock value)
  const acValuation = acUnits.reduce(
    (acc, { listPrice, quantity }) => acc + (Number(listPrice) || 0) * (Number(quantity) || 0),
    0
  );
  const partsValuation = materials.reduce(
    (acc, { listPrice, quantity }) => acc + (Number(listPrice) || 0) * (Number(quantity) || 0),
    0
  );
  const acValuationPct = totalValuation > 0 ? Math.round((acValuation / totalValuation) * 100) : 100;

  const columns = [
    {
      title: 'SKU / Model',
      dataIndex: 'sku',
      key: 'sku',
      render: (sku, record) => (
        <Space>
          <Text code style={{ fontWeight: 600 }}>
            {sku}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space direction="vertical" size={1}>
          <Text strong>{name}</Text>
          <Text style={{ fontSize: 12 }} type="secondary">
            {record.brand} · {record.capacity || 'N/A'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Tag color="blue">{cat}</Tag>,
    },
    {
      title: 'Current Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty, record) => (
        <Tag color="error" style={{ fontWeight: 700, fontSize: 13, padding: '2px 8px' }}>
          {qty} {record.unitOfMeasure || 'units'}
        </Tag>
      ),
    },
    {
      title: 'Min Threshold',
      dataIndex: 'reorderLevel',
      key: 'reorderLevel',
      render: (val) => `${val || 3} units`,
    },
    {
      title: 'Shortfall',
      key: 'shortfall',
      render: (_, r) => {
        const diff = (r.reorderLevel || 3) - r.quantity;
        return (
          <Text type="danger" strong>
            {diff > 0 ? `-${diff} units needed` : 'At Minimum'}
          </Text>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Tag
          color="processing"
          style={{
            cursor: 'pointer',
            padding: '3px 10px',
            borderRadius: 6,
            fontWeight: 600,
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (onRestockItem) onRestockItem(record.id);
          }}
        >
          ⬇️ Restock Now
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header and View Mode Switcher */}
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
            Aircon Inventory Overview
          </Title>
          <Paragraph type="secondary" style={{ margin: '4px 0 0', fontSize: 14 }}>
            Live warehouse analytics, active catalog stock levels, replenishment alerts, and valuation.
          </Paragraph>
        </div>

        {/* View Mode Switcher: Cards, Bar Chart, Pie Chart */}
        <Radio.Group
          value={metricViewMode}
          onChange={(e) => handleViewModeChange(e.target.value)}
          buttonStyle="solid"
          size="middle"
        >
          <Radio.Button value="cards">
            <AppstoreAddOutlined style={{ marginRight: 6 }} />
            Default Cards
          </Radio.Button>
          <Radio.Button value="bar">
            <BarChartOutlined style={{ marginRight: 6 }} />
            Bar Chart View
          </Radio.Button>
          <Radio.Button value="pie">
            <PieChartOutlined style={{ marginRight: 6 }} />
            Pie Chart View
          </Radio.Button>
        </Radio.Group>
      </div>

      {/* ─── 1. DEFAULT CARDS VIEW ─────────────────────────── */}
      {metricViewMode === 'cards' && (
        <Row gutter={[16, 16]}>
          {/* Card 1: AC Units in Stock -> Filters for AC Unit */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              hoverable
              style={{
                borderRadius: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: `1px solid ${token.colorBorderSecondary}`,
                cursor: 'pointer',
              }}
              onClick={() => {
                if (onNavigateToInventoryWithFilter) {
                  onNavigateToInventoryWithFilter({ itemType: 'AC Unit' });
                }
              }}
            >
              <Statistic
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>AC Units in Stock</Text>
                    <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>View in Catalog →</Tag>
                  </div>
                }
                valueRender={() => (
                  <span style={{ fontWeight: 700, fontSize: 24 }}>
                    <AnimatedCounter
                      endValue={acUnits.length}
                      duration={240}
                      triggerAnimation={cardAnimTrigger}
                    />
                  </span>
                )}
                prefix={<AppstoreOutlined style={{ color: '#2563eb', marginRight: 6 }} />}
                suffix={<span style={{ fontSize: 13, color: token.colorTextTertiary }}>models</span>}
                valueStyle={{ fontWeight: 700 }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: token.colorTextSecondary }}>
                Split, Window, Portable & Floor systems
              </div>
            </Card>
          </Col>

          {/* Card 2: Parts & Freon Refrigerants -> Filters for Material / Part */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              hoverable
              style={{
                borderRadius: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: `1px solid ${token.colorBorderSecondary}`,
                cursor: 'pointer',
              }}
              onClick={() => {
                if (onNavigateToInventoryWithFilter) {
                  onNavigateToInventoryWithFilter({ itemType: 'Material / Part' });
                }
              }}
            >
              <Statistic
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Parts & Freon Refrigerants</Text>
                    <Tag color="orange" style={{ fontSize: 10, margin: 0 }}>View in Catalog →</Tag>
                  </div>
                }
                valueRender={() => (
                  <span style={{ fontWeight: 700, fontSize: 24 }}>
                    <AnimatedCounter
                      endValue={materials.length}
                      duration={240}
                      triggerAnimation={cardAnimTrigger}
                    />
                  </span>
                )}
                prefix={<ToolOutlined style={{ color: '#d97706', marginRight: 6 }} />}
                suffix={<span style={{ fontSize: 13, color: token.colorTextTertiary }}>items</span>}
                valueStyle={{ fontWeight: 700 }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: token.colorTextSecondary }}>
                Compressors, copper tubes & supplies
              </div>
            </Card>
          </Col>

          {/* Card 3: Restock Warnings */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              hoverable
              style={{
                borderRadius: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: lowStockItems.length > 0 ? '1px solid #fecaca' : `1px solid ${token.colorBorderSecondary}`,
                backgroundColor: lowStockItems.length > 0 ? token.colorBgElevated : undefined,
                cursor: 'pointer',
              }}
              onClick={() => {
                const alertTableEl = document.getElementById('low-stock-register');
                if (alertTableEl) {
                  alertTableEl.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <Statistic
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Restock Warnings</Text>
                    <Tag color="error" style={{ fontSize: 10, margin: 0 }}>See Alerts ↓</Tag>
                  </div>
                }
                valueRender={() => (
                  <span style={{ fontWeight: 700, fontSize: 24, color: lowStockItems.length > 0 ? '#dc2626' : undefined }}>
                    <AnimatedCounter
                      endValue={lowStockItems.length}
                      duration={220}
                      triggerAnimation={cardAnimTrigger}
                    />
                  </span>
                )}
                prefix={<AlertOutlined style={{ color: '#ef4444', marginRight: 6 }} />}
                suffix={<span style={{ fontSize: 13, color: '#ef4444' }}>critical</span>}
                valueStyle={{ fontWeight: 700, color: lowStockItems.length > 0 ? '#dc2626' : undefined }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: lowStockItems.length > 0 ? '#dc2626' : token.colorTextSecondary }}>
                {lowStockItems.length > 0 ? 'Requires immediate replenishment' : 'Stock levels optimal'}
              </div>
            </Card>
          </Col>

          {/* Card 4: Total Warehouse Valuation -> Views all inventory */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              hoverable
              style={{
                borderRadius: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: `1px solid ${token.colorBorderSecondary}`,
                cursor: 'pointer',
              }}
              onClick={() => {
                if (onNavigateToInventoryWithFilter) {
                  onNavigateToInventoryWithFilter({ itemType: 'ALL' });
                }
              }}
            >
              <Statistic
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Total Warehouse Valuation</Text>
                    <Tag color="success" style={{ fontSize: 10, margin: 0 }}>Catalog Overview →</Tag>
                  </div>
                }
                valueRender={() => (
                  <span style={{ fontWeight: 700, color: '#059669', fontSize: 22 }}>
                    <AnimatedCounter
                      endValue={totalValuation}
                      duration={320}
                      isCurrency={true}
                      triggerAnimation={cardAnimTrigger}
                    />
                  </span>
                )}
                prefix={<DollarOutlined style={{ color: '#059669', marginRight: 6 }} />}
                valueStyle={{ fontWeight: 700, color: '#059669', fontSize: 22 }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: token.colorTextSecondary }}>
                <ArrowUpOutlined style={{ color: '#059669' }} />{' '}
                <AnimatedCounter
                  endValue={totalPhysicalUnits}
                  duration={260}
                  triggerAnimation={cardAnimTrigger}
                />{' '}
                physical units in warehouse
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* ─── 2. AUTHENTIC VERTICAL COLUMN BAR CHART ────────── */}
      {metricViewMode === 'bar' && (
        <Card
          bordered={false}
          style={{
            borderRadius: 14,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: `1px solid ${token.colorBorderSecondary}`,
            marginBottom: 24,
          }}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <BarChartOutlined style={{ color: '#2563eb', fontSize: 18 }} />
                <Text strong style={{ fontSize: 16 }}>
                  Warehouse Inventory Bar Chart
                </Text>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Real-time Stock Levels & Category Distribution
              </Text>
            </div>
          }
        >
          {(() => {
            // Distinct bar columns to chart with click filters
            const barData = [
              {
                label: 'Split Type AC',
                count: acSplitCount,
                units: acUnits.filter((i) => i.category === 'Split Type').reduce((a, b) => a + (Number(b.quantity) || 0), 0),
                color: '#2563eb',
                filter: { itemType: 'AC Unit', category: 'Split Type' },
              },
              {
                label: 'Window Type AC',
                count: acWindowCount,
                units: acUnits.filter((i) => i.category === 'Window Type').reduce((a, b) => a + (Number(b.quantity) || 0), 0),
                color: '#3b82f6',
                filter: { itemType: 'AC Unit', category: 'Window Type' },
              },
              {
                label: 'Floor / Portable',
                count: acFloorCount + acPortableCount,
                units: acUnits.filter((i) => i.category === 'Floor Mounted' || i.category === 'Portable').reduce((a, b) => a + (Number(b.quantity) || 0), 0),
                color: '#60a5fa',
                filter: { itemType: 'AC Unit', category: 'Floor Mounted' },
              },
              {
                label: 'Compressors',
                count: compressorsCount,
                units: materials.filter((i) => i.category === 'Compressors').reduce((a, b) => a + (Number(b.quantity) || 0), 0),
                color: '#d97706',
                filter: { itemType: 'Material / Part', category: 'Compressors' },
              },
              {
                label: 'Freon Gas',
                count: refrigerantsCount,
                units: materials.filter((i) => i.category === 'Refrigerants').reduce((a, b) => a + (Number(b.quantity) || 0), 0),
                color: '#f59e0b',
                filter: { itemType: 'Material / Part', category: 'Refrigerants' },
              },
              {
                label: 'Install Supplies',
                count: installMatCount,
                units: materials.filter((i) => i.category === 'Installation Materials' || i.category === 'Copper Tubing').reduce((a, b) => a + (Number(b.quantity) || 0), 0),
                color: '#10b981',
                filter: { itemType: 'Material / Part', category: 'Installation Materials' },
              },
              {
                label: 'Low Stock Alerts',
                count: lowStockItems.length,
                units: lowStockItems.reduce((a, b) => a + (Number(b.quantity) || 0), 0),
                color: '#ef4444',
                isAlert: true,
              },
            ];

            const maxUnits = Math.max(...barData.map((d) => d.units), 10);
            // Nice round ceiling for chart top
            const chartCeiling = Math.ceil(maxUnits / 10) * 10 || 20;
            const gridTicks = [chartCeiling, Math.round(chartCeiling * 0.75), Math.round(chartCeiling * 0.5), Math.round(chartCeiling * 0.25), 0];

            return (
              <div style={{ padding: '10px 10px 0' }}>
                {/* Chart Plot Area */}
                <div style={{ position: 'relative', height: 260, display: 'flex', alignItems: 'flex-end', marginLeft: 45, marginRight: 15 }}>
                  {/* Y-Axis Grid Lines & Tick Labels */}
                  {gridTicks.map((tick, idx) => {
                    const bottomPercent = (tick / chartCeiling) * 100;
                    return (
                      <div
                        key={idx}
                        style={{
                          position: 'absolute',
                          left: -45,
                          right: 0,
                          bottom: `${bottomPercent}%`,
                          display: 'flex',
                          alignItems: 'center',
                          pointerEvents: 'none',
                        }}
                      >
                        <span
                          style={{
                            width: 35,
                            textAlign: 'right',
                            fontSize: 11,
                            color: token.colorTextTertiary,
                            paddingRight: 10,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {tick}
                        </span>
                        <div
                          style={{
                            flex: 1,
                            borderBottom: `1px ${tick === 0 ? 'solid' : 'dashed'} ${token.colorBorderSecondary}`,
                          }}
                        />
                      </div>
                    );
                  })}

                  {/* Vertical Columns Container */}
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 2,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-around',
                      paddingLeft: 10,
                      paddingRight: 10,
                    }}
                  >
                    {barData.map((bar, idx) => {
                      const targetHeightPercent = chartCeiling > 0 ? (bar.units / chartCeiling) * 100 : 0;
                      const currentHeightPercent = barAnimTrigger ? Math.max(targetHeightPercent, 3) : 0;
                      const handleBarClick = () => {
                        if (bar.isAlert) {
                          const alertTableEl = document.getElementById('low-stock-register');
                          if (alertTableEl) alertTableEl.scrollIntoView({ behavior: 'smooth' });
                        } else if (bar.filter && onNavigateToInventoryWithFilter) {
                          onNavigateToInventoryWithFilter(bar.filter);
                        }
                      };

                      return (
                        <div
                          key={idx}
                          style={{
                            flex: 1,
                            maxWidth: 68,
                            margin: '0 8px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            height: '100%',
                            justifyContent: 'flex-end',
                          }}
                        >
                          {/* Value Pill above the Bar */}
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: bar.units > 0 ? bar.color : token.colorTextTertiary,
                              marginBottom: 6,
                              opacity: barAnimTrigger ? 1 : 0,
                              transform: barAnimTrigger ? 'translateY(0)' : 'translateY(8px)',
                              transition: `opacity 0.4s ease-out ${0.15 + idx * 0.08}s, transform 0.4s ease-out ${0.15 + idx * 0.08}s`,
                            }}
                          >
                            {bar.units}
                          </div>

                          {/* The Real Vertical Column Bar (Animated & Clickable) */}
                          <div
                            style={{
                              width: '100%',
                              height: `${currentHeightPercent}%`,
                              backgroundColor: bar.color,
                              borderRadius: '6px 6px 0 0',
                              boxShadow: barAnimTrigger && bar.units > 0 ? `0 3px 12px ${bar.color}40` : 'none',
                              transition: `height 0.85s cubic-bezier(0.34, 1.25, 0.64, 1) ${idx * 0.07}s, transform 0.25s ease-out, filter 0.25s ease-out, opacity 0.4s ease-out`,
                              cursor: 'pointer',
                              position: 'relative',
                              opacity: !barAnimTrigger ? 0 : bar.units > 0 ? 1 : 0.35,
                            }}
                            onClick={handleBarClick}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scaleY(1.04) scaleX(1.06)';
                              e.currentTarget.style.filter = 'brightness(1.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'none';
                              e.currentTarget.style.filter = 'none';
                            }}
                            title={`${bar.label}: ${bar.units} physical units (${bar.count} models/items). Click to filter in catalog.`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* X-Axis Labels Row (Clickable) */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    marginLeft: 45,
                    marginRight: 15,
                    paddingTop: 12,
                    paddingLeft: 10,
                    paddingRight: 10,
                    borderTop: `2px solid ${token.colorBorderSecondary}`,
                  }}
                >
                  {barData.map((bar, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        if (bar.isAlert) {
                          const alertTableEl = document.getElementById('low-stock-register');
                          if (alertTableEl) alertTableEl.scrollIntoView({ behavior: 'smooth' });
                        } else if (bar.filter && onNavigateToInventoryWithFilter) {
                          onNavigateToInventoryWithFilter(bar.filter);
                        }
                      }}
                      style={{
                        flex: 1,
                        maxWidth: 68,
                        margin: '0 8px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                      }}
                      title="Click to filter catalog"
                    >
                      <Text
                        strong
                        style={{
                          fontSize: 11,
                          display: 'block',
                          lineHeight: 1.2,
                          color: token.colorText,
                        }}
                      >
                        {bar.label}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        {bar.count} {bar.label.includes('Alert') ? 'warns' : 'items'}
                      </Text>
                    </div>
                  ))}
                </div>

                {/* Bottom Bar Chart Legend & Metric Summary */}
                <div
                  style={{
                    marginTop: 24,
                    padding: '12px 18px',
                    borderRadius: 10,
                    background: token.colorFillAlter,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <Space size="large" wrap>
                    <Space size="small">
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: '#2563eb' }} />
                      <Text style={{ fontSize: 12 }}>AC Systems: <strong>{acUnits.reduce((a, b) => a + (Number(b.quantity) || 0), 0)} units</strong></Text>
                    </Space>
                    <Space size="small">
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: '#d97706' }} />
                      <Text style={{ fontSize: 12 }}>Parts & Freon: <strong>{materials.reduce((a, b) => a + (Number(b.quantity) || 0), 0)} units</strong></Text>
                    </Space>
                    <Space size="small">
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: '#ef4444' }} />
                      <Text style={{ fontSize: 12 }}>Restock Alerts: <strong>{lowStockItems.length} items</strong></Text>
                    </Space>
                  </Space>

                  <div>
                    <Text type="secondary" style={{ fontSize: 12, marginRight: 8 }}>Total Inventory Valuation:</Text>
                    <Text strong style={{ color: '#059669', fontSize: 16 }}>{formatMoney(totalValuation)}</Text>
                  </div>
                </div>
              </div>
            );
          })()}
        </Card>
      )}

      {/* ─── 3. INDIVIDUAL PIE CHARTS WITH ANIMATION ───────── */}
      {metricViewMode === 'pie' && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <PieChartOutlined style={{ color: '#059669', fontSize: 18 }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              Live KPI Donut & Pie Chart Suite
            </Title>
            <Tag color="green" style={{ marginLeft: 8, borderRadius: 4 }}>
              Interactive Radial Meters
            </Tag>
          </div>

          <Row gutter={[14, 14]}>
            {/* Pie Chart 1: AC Units in Stock */}
            <Col xs={24}>
              <AnimatedDonutCard
                title="AC Units in Stock"
                subtitle="Air conditioning equipment"
                icon={<AppstoreOutlined />}
                color="#2563eb"
                percentage={acUnitsPct}
                centerPrimary={`${acUnits.length} Models`}
                centerSecondary={`${acUnitsPct}% of catalog`}
                triggerAnimation={chartAnimTrigger}
                token={token}
                onClick={onNavigateToInventoryWithFilter ? () => onNavigateToInventoryWithFilter({ itemType: 'AC Unit' }) : undefined}
                breakdown={[
                  {
                    label: 'Split Type',
                    value: `${acSplitCount} units`,
                    color: '#2563eb',
                    onClick: onNavigateToInventoryWithFilter ? () => onNavigateToInventoryWithFilter({ itemType: 'AC Unit', category: 'Split Type' }) : undefined,
                  },
                  {
                    label: 'Window Type',
                    value: `${acWindowCount} units`,
                    color: '#3b82f6',
                    onClick: onNavigateToInventoryWithFilter ? () => onNavigateToInventoryWithFilter({ itemType: 'AC Unit', category: 'Window Type' }) : undefined,
                  },
                  {
                    label: 'Floor / Portable',
                    value: `${acFloorCount + acPortableCount} units`,
                    color: '#60a5fa',
                    onClick: onNavigateToInventoryWithFilter ? () => onNavigateToInventoryWithFilter({ itemType: 'AC Unit', category: 'Floor Mounted' }) : undefined,
                  },
                ]}
              />
            </Col>

            {/* Pie Chart 2: Parts & Freon Refrigerants */}
            <Col xs={24}>
              <AnimatedDonutCard
                title="Parts & Freon"
                subtitle="Consumables & spare parts"
                icon={<ToolOutlined />}
                color="#d97706"
                percentage={partsPct}
                centerPrimary={`${materials.length} Items`}
                centerSecondary={`${partsPct}% of catalog`}
                triggerAnimation={chartAnimTrigger}
                token={token}
                onClick={onNavigateToInventoryWithFilter ? () => onNavigateToInventoryWithFilter({ itemType: 'Material / Part' }) : undefined}
                breakdown={[
                  {
                    label: 'Compressors',
                    value: `${compressorsCount} items`,
                    color: '#d97706',
                    onClick: onNavigateToInventoryWithFilter ? () => onNavigateToInventoryWithFilter({ itemType: 'Material / Part', category: 'Compressors' }) : undefined,
                  },
                  {
                    label: 'Refrigerants',
                    value: `${refrigerantsCount} items`,
                    color: '#f59e0b',
                    onClick: onNavigateToInventoryWithFilter ? () => onNavigateToInventoryWithFilter({ itemType: 'Material / Part', category: 'Refrigerants' }) : undefined,
                  },
                  {
                    label: 'Installation Mat.',
                    value: `${installMatCount} items`,
                    color: '#fbbf24',
                    onClick: onNavigateToInventoryWithFilter ? () => onNavigateToInventoryWithFilter({ itemType: 'Material / Part', category: 'Installation Materials' }) : undefined,
                  },
                ]}
              />
            </Col>

            {/* Pie Chart 3: Restock Warnings */}
            <Col xs={24}>
              <AnimatedDonutCard
                title="Restock Warnings"
                subtitle="Replenishment thresholds"
                icon={<AlertOutlined />}
                color="#ef4444"
                percentage={lowStockPct}
                centerPrimary={`${lowStockItems.length} Critical`}
                centerSecondary={lowStockItems.length > 0 ? 'Action needed' : 'Safe stock'}
                triggerAnimation={chartAnimTrigger}
                token={token}
                onClick={() => {
                  const alertTableEl = document.getElementById('low-stock-register');
                  if (alertTableEl) alertTableEl.scrollIntoView({ behavior: 'smooth' });
                }}
                breakdown={[
                  {
                    label: 'Critical Below Min',
                    value: `${lowStockItems.length} items`,
                    color: '#ef4444',
                    onClick: () => {
                      const alertTableEl = document.getElementById('low-stock-register');
                      if (alertTableEl) alertTableEl.scrollIntoView({ behavior: 'smooth' });
                    },
                  },
                  {
                    label: 'Zero Stock Out',
                    value: `${zeroStockCount} items`,
                    color: '#dc2626',
                    onClick: () => {
                      const alertTableEl = document.getElementById('low-stock-register');
                      if (alertTableEl) alertTableEl.scrollIntoView({ behavior: 'smooth' });
                    },
                  },
                  {
                    label: 'Healthy Stock',
                    value: `${items.length - lowStockItems.length} items`,
                    color: '#10b981',
                    onClick: onNavigateToInventoryWithFilter ? () => onNavigateToInventoryWithFilter({ itemType: 'ALL' }) : undefined,
                  },
                ]}
              />
            </Col>

            {/* Pie Chart 4: Total Warehouse Valuation */}
            <Col xs={24}>
              <AnimatedDonutCard
                title="Warehouse Valuation"
                subtitle="Capital inventory assets"
                icon={<DollarOutlined />}
                color="#059669"
                percentage={acValuationPct}
                centerPrimary={formatMoney(totalValuation)}
                centerSecondary={`${totalPhysicalUnits} units`}
                triggerAnimation={chartAnimTrigger}
                token={token}
                onClick={onNavigateToInventoryWithFilter ? () => onNavigateToInventoryWithFilter({ itemType: 'ALL' }) : undefined}
                breakdown={[
                  {
                    label: 'AC Equipment',
                    value: formatMoney(acValuation),
                    color: '#2563eb',
                    onClick: onNavigateToInventoryWithFilter ? () => onNavigateToInventoryWithFilter({ itemType: 'AC Unit' }) : undefined,
                  },
                  {
                    label: 'Parts & Freon',
                    value: formatMoney(partsValuation),
                    color: '#d97706',
                    onClick: onNavigateToInventoryWithFilter ? () => onNavigateToInventoryWithFilter({ itemType: 'Material / Part' }) : undefined,
                  },
                  {
                    label: 'AC Value Ratio',
                    value: `${acValuationPct}% equipment`,
                    color: '#059669',
                    onClick: onNavigateToInventoryWithFilter ? () => onNavigateToInventoryWithFilter({ itemType: 'ALL' }) : undefined,
                  },
                ]}
              />
            </Col>
          </Row>
        </div>
      )}

      {/* Low Stock Alert Table */}
      <Card
        id="low-stock-register"
        title={
          <Space>
            <AlertOutlined style={{ color: '#dc2626' }} />
            <Text strong style={{ fontSize: 16 }}>
              Low Stock & Reorder Alert Register
            </Text>
          </Space>
        }
        style={{
          marginTop: 24,
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
        bordered={false}
      >
        <Table
          dataSource={lowStockItems}
          columns={columns}
          rowKey="id"
          pagination={false}
          onRow={(record) => ({
            onClick: () => {
              if (onRestockItem) onRestockItem(record.id);
            },
            style: { cursor: 'pointer' },
          })}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="All items in stock are currently above their minimum safety thresholds."
              />
            ),
          }}
        />
      </Card>
    </div>
  );
}
