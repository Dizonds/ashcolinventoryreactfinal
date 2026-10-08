import React, { useState, useEffect } from "react";
import {
  Card,
  Statistic,
  Table,
  Button,
  Tag,
  Typography,
  Space,
  Radio,
  Progress,
  Row,
  Col,
} from "antd";
import { formatMoney } from "../utils/formatters";
import { api } from "../api";

export default function DashboardPage({
  items,
  requests,
  branchId,
  canManage,
  onRestockItem,
  onNavigateToInventoryWithFilter,
}) {
  const [view, setView] = useState("cards");
  const [analytics, setAnalytics] = useState({ fastMoving: [], slowMoving: [] });

  useEffect(() => {
    if (!branchId) return;
    let active = true;
    api("get", "/analytics", null, { branchId })
      .then(({ data }) => {
        if (active) setAnalytics(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [branchId, items]);

  const low = items.filter(
    (item) => item.quantity > 0 && item.quantity <= item.reorderLevel,
  );
  const out = items.filter((item) => item.quantity === 0);
  const high = items.filter(
    (item) =>
      item.quantity > (item.reorderLevel > 0 ? item.reorderLevel * 4 : 20),
  );
  const warnings = items.filter((item) => item.quantity <= item.reorderLevel);
  const cost = items.reduce(
    (sum, item) => sum + item.unitCost * item.quantity,
    0,
  );
  const salesValue = items.reduce(
    (sum, item) => sum + item.listPrice * item.quantity,
    0,
  );
  const pending = requests.filter(
    (request) => request.status === "PENDING",
  ).length;
  const totals = items.reduce((result, item) => {
    const unit = item.unitOfMeasure;
    result[unit] =
      Math.round(((result[unit] || 0) + item.quantity) * 1000) / 1000;
    return result;
  }, {});
  const categories = [
    "Split Type",
    "Window Type",
    "Floor Mounted",
    "Portable",
    "Compressors",
    "Fan Motors",
    "PCBs & Inverters",
    "Refrigerants",
    "Copper Tubing",
    "Installation Materials",
    "Vacuum Pumps",
    "Manifold Gauges",
  ];
  const breakdown = categories
    .map((category) => ({
      category,
      count: items.filter((item) => item.category === category).length,
    }))
    .filter((entry) => entry.count > 0);
  return (
    <>
      <Typography.Title level={3}>Branch Inventory Overview</Typography.Title>
      <Typography.Paragraph type="secondary">
        Stock readiness, material requests and recorded inventory cost for this
        branch.
      </Typography.Paragraph>
      <div className="metric-grid">
        <Card>
          <Statistic title="Catalog items" value={items.length} />
          <Button
            type="link"
            onClick={() => onNavigateToInventoryWithFilter({})}
          >
            View catalog
          </Button>
        </Card>
        <Card>
          <Statistic title="Low stock" value={low.length} />
          <Button
            type="link"
            onClick={() => onNavigateToInventoryWithFilter({ status: "LOW" })}
          >
            View low stock
          </Button>
        </Card>
        <Card>
          <Statistic title="Out of stock" value={out.length} />
          <Button
            type="link"
            onClick={() => onNavigateToInventoryWithFilter({ status: "OUT" })}
          >
            View unavailable
          </Button>
        </Card>
        <Card>
          <Statistic title="Surplus / High stock" value={high.length} />
          <Button
            type="link"
            onClick={() => onNavigateToInventoryWithFilter({})}
          >
            Well-buffered SKUs
          </Button>
        </Card>
        <Card>
          <Statistic
            title="Reserved for Jobs"
            value={items.reduce((acc, it) => acc + (it.reservedQuantity || 0), 0)}
          />
          <div style={{ marginTop: 8 }}>
            <small style={{ color: "#888" }}>Approved requests awaiting pull-out</small>
          </div>
        </Card>
        <Card>
          <Statistic title="Pending material requests" value={pending} />
        </Card>
      </div>
      <Card style={{ marginBottom: 20 }}>
        <Space size="large" wrap>
          <Statistic
            title="Inventory value at recorded unit cost"
            value={formatMoney(cost)}
          />
          <Statistic
            title="Potential sales value"
            value={formatMoney(salesValue)}
          />
        </Space>
        <Typography.Paragraph type="secondary">
          These are current catalog-cost estimates, not FIFO or historical
          accounting valuations.
        </Typography.Paragraph>
        <Space wrap>
          {Object.keys(totals).map((unit) => (
            <Tag key={unit}>
              {totals[unit]} {unit}
            </Tag>
          ))}
        </Space>
      </Card>
      <Card title="Catalog composition" style={{ marginBottom: 20 }}>
        <Radio.Group
          style={{ marginBottom: 20 }}
          value={view}
          onChange={(e) => setView(e.target.value)}
          options={[
            { label: "Cards", value: "cards" },
            { label: "Bars", value: "bar" },
            { label: "Circles", value: "pie" },
          ]}
        />
        <div className="metric-grid">
          {breakdown.map((entry) => (
            <div key={entry.category}>
              <Button
                type="link"
                style={{ padding: 0 }}
                onClick={() =>
                  onNavigateToInventoryWithFilter({ category: entry.category })
                }
              >
                {entry.category}
              </Button>
              {view === "cards" ? (
                <Statistic value={entry.count} suffix="SKUs" />
              ) : (
                <div style={{ marginTop: 12 }}>
                  <Progress
                    type={view === "pie" ? "circle" : "line"}
                    percent={
                      items.length
                        ? Math.round((entry.count / items.length) * 100)
                        : 0
                    }
                    size={80}
                  />
                  <div>{entry.count} SKUs</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} md={12}>
          <Card
            title="🚀 Fast-Moving Supplies (Past 30 Days)"
            extra={<Tag color="green">High Turn-over</Tag>}
          >
            <Table
              size="small"
              rowKey="id"
              dataSource={analytics.fastMoving}
              pagination={false}
              locale={{
                emptyText: "No high-turnover items in the past 30 days.",
              }}
              columns={[
                { title: "SKU", dataIndex: "sku", render: (s) => <strong>{s}</strong> },
                { title: "Item Name", dataIndex: "name" },
                {
                  title: "Dispatched",
                  render: (_, r) => (
                    <Tag color="green">
                      {r.dispatched30d} {r.unitOfMeasure}
                    </Tag>
                  ),
                },
                {
                  title: "Remaining",
                  render: (_, r) => `${r.quantity} ${r.unitOfMeasure}`,
                },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title="⏳ Slow-Moving / Dormant Supplies"
            extra={<Tag color="orange">Zero Dispatches (30d)</Tag>}
          >
            <Table
              size="small"
              rowKey="id"
              dataSource={analytics.slowMoving}
              pagination={false}
              locale={{
                emptyText: "All supplies are active.",
              }}
              columns={[
                { title: "SKU", dataIndex: "sku", render: (s) => <strong>{s}</strong> },
                { title: "Item Name", dataIndex: "name" },
                {
                  title: "Category",
                  dataIndex: "category",
                  render: (c) => <Tag>{c}</Tag>,
                },
                {
                  title: "Current Stock",
                  render: (_, r) => `${r.quantity} ${r.unitOfMeasure}`,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Reorder watch list">
        <Table
          rowKey="id"
          dataSource={warnings}
          scroll={{ x: 650 }}
          pagination={{ defaultPageSize: 10 }}
          columns={[
            { title: "SKU", dataIndex: "sku" },
            { title: "Item", dataIndex: "name" },
            {
              title: "Available",
              render: (_, item) => `${item.quantity} ${item.unitOfMeasure}`,
            },
            {
              title: "Reorder level",
              render: (_, item) => `${item.reorderLevel} ${item.unitOfMeasure}`,
            },
            {
              title: "Status",
              render: (_, item) => (
                <Tag color={item.quantity === 0 ? "red" : "orange"}>
                  {item.quantity === 0 ? "Out of stock" : "Low stock"}
                </Tag>
              ),
            },
            ...(canManage
              ? [
                  {
                    title: "Action",
                    render: (_, item) => (
                      <Button onClick={() => onRestockItem(item.id)}>
                        Restock
                      </Button>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </Card>
    </>
  );
}
