import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Select,
  Modal,
  Input,
  InputNumber,
  Switch,
  Alert,
  Popconfirm,
  Typography,
  Descriptions,
} from "antd";
import { api, errorMessage } from "../api";
import { formatMoney } from "../utils/formatters";

const emptyItem = {
  sku: "",
  name: "",
  itemType: "AC Unit",
  category: "Split Type",
  brand: "Carrier",
  capacity: "",
  unitOfMeasure: "UNIT",
  unitCost: 0,
  listPrice: 0,
  quantity: 0,
  reorderLevel: 3,
  supplier: "",
  compatibleModels: [],
};
const isContinuousUnit = (unit) =>
  ["METER", "FOOT", "KG", "LITER"].includes(unit);

const units = [
  "UNIT",
  "PCS",
  "METER",
  "FOOT",
  "KG",
  "LITER",
  "ROLL",
  "CYLINDER",
  "CYL",
  "PAIR",
  "CAN",
  "SET",
];
export default function InventorySection({
  items,
  brands,
  user,
  branchId,
  save,
  preselectedFilter,
  onNavigateToPostMovement,
}) {
  const canManage = user.role !== "EMPLOYEE";
  const [search, setSearch] = useState("");
  const [type, setType] = useState(
    preselectedFilter && preselectedFilter.itemType
      ? preselectedFilter.itemType
      : "ALL",
  );
  const [status, setStatus] = useState(
    preselectedFilter && preselectedFilter.status
      ? preselectedFilter.status
      : "ALL",
  );
  const [category, setCategory] = useState(
    preselectedFilter && preselectedFilter.category
      ? preselectedFilter.category
      : "",
  );
  const [brand, setBrand] = useState("");
  const [archived, setArchived] = useState(false);
  const [archivedItems, setArchivedItems] = useState([]);
  const [archiveError, setArchiveError] = useState("");
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [values, setValues] = useState(emptyItem);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const categoriesByType = {
    "AC Unit": ["Split Type", "Window Type", "Floor Mounted", "Portable"],
    "Spare Part": [
      "Compressors",
      "Fan Motors",
      "PCBs & Inverters",
      "Capacitors",
      "Sensors & Thermostats",
      "Valves & Coils",
    ],
    "Consumable": [
      "Refrigerants",
      "Copper Tubing",
      "Installation Materials",
      "Insulation & Aerotape",
      "Drain Hoses & Fittings",
      "Brazing & Silver Rods",
    ],
    "Tool / Equipment": [
      "Vacuum Pumps",
      "Manifold Gauges",
      "Flaring & Swaging Tools",
      "Clamp & Multimeters",
      "Leak Detectors",
      "Hand Tools",
    ],
    "Material / Part": [
      "Compressors",
      "Refrigerants",
      "Installation Materials",
      "Copper Tubing",
    ],
  };
  const categories = categoriesByType[values.itemType] || [
    "Compressors",
    "Refrigerants",
    "Installation Materials",
    "Copper Tubing",
  ];
  useEffect(() => {
    if (!archived) return;
    let active = true;
    setArchiveError("");
    setArchiveLoading(true);
    api("get", "/products", null, { branchId, archived: true })
      .then(({ data }) => {
        if (active) setArchivedItems(data);
      })
      .catch((err) => {
        if (active) setArchiveError(errorMessage(err));
      })
      .finally(() => {
        if (active) setArchiveLoading(false);
      });
    return () => {
      active = false;
    };
  }, [archived, branchId, items]);
  function field(name, value) {
    setValues({ ...values, [name]: value });
  }
  function open(item) {
    setValues(item || { ...emptyItem });
    setEditing(item ? item.id : "new");
    setFormError("");
  }
  function submit(event) {
    event.preventDefault();
    setBusy(true);
    setFormError("");
    const payload = { ...values, branchId };
    if (editing !== "new") delete payload.quantity;
    save(
      editing === "new" ? "post" : "put",
      editing === "new" ? "/products" : `/products/${editing}`,
      payload,
      "Inventory item saved.",
    )
      .then(() => setEditing(null))
      .catch((err) => setFormError(errorMessage(err)))
      .finally(() => setBusy(false));
  }
  const visible = (archived ? archivedItems : items).filter((item) => {
    const matchesText = `${item.sku} ${item.name} ${item.brand}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return (
      matchesText &&
      (type === "ALL" || item.itemType === type) &&
      (!category || item.category === category) &&
      (!brand || item.brand === brand) &&
      (status === "ALL" ||
        (status === "LOW"
          ? item.quantity > 0 && item.quantity <= item.reorderLevel
          : item.quantity === 0))
    );
  });
  const columns = [
    { title: "SKU", dataIndex: "sku" },
    { title: "Item", dataIndex: "name" },
    {
      title: "Type / category",
      render: (_, item) => (
        <div>
          {item.itemType}
          <br />
          <small>{item.category}</small>
        </div>
      ),
    },
    { title: "Brand", dataIndex: "brand" },
    {
      title: "Selling price",
      render: (_, item) => formatMoney(item.listPrice),
    },
    {
      title: "Stock & Availability",
      render: (_, item) => (
        <div>
          <Tag
            color={
              item.quantity === 0
                ? "red"
                : item.quantity <= item.reorderLevel
                  ? "orange"
                  : "green"
            }
          >
            {item.quantity} {item.unitOfMeasure} (On Hand)
          </Tag>
          {item.reservedQuantity > 0 && (
            <div style={{ marginTop: 4 }}>
              <Tag color="cyan">
                {item.reservedQuantity} {item.unitOfMeasure} (Reserved)
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Reorder level",
      render: (_, item) => `${item.reorderLevel} ${item.unitOfMeasure}`,
    },
    {
      title: "Actions",
      render: (_, item) => (
        <Space wrap>
          <Button size="small" onClick={() => setViewing(item)}>
            Specs
          </Button>
          {canManage && !archived && (
            <Button size="small" onClick={() => open(item)}>
              Edit
            </Button>
          )}
          {canManage && (
            <Popconfirm
              title={
                archived
                  ? "Restore this item?"
                  : "Archive this zero-stock item?"
              }
              description="Stock history is retained."
              onConfirm={() =>
                save(
                  archived ? "post" : "delete",
                  archived
                    ? `/products/${item.id}/restore`
                    : `/products/${item.id}`,
                  archived ? { branchId } : null,
                  archived ? "Item restored." : "Item archived.",
                  { branchId },
                ).catch(() => {})
              }
            >
              <Button size="small" danger={!archived}>
                {archived ? "Restore" : "Archive"}
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];
  return (
    <>
      <Typography.Title level={3}>Inventory Catalog</Typography.Title>
      <Typography.Paragraph type="secondary">
        AC equipment and service materials for the selected branch. Stock
        quantities change only through recorded movements.
      </Typography.Paragraph>
      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search SKU, name or brand"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
          <Select
            aria-label="Item type filter"
            value={type}
            onChange={setType}
            style={{ width: 160 }}
            options={[
              "ALL",
              "AC Unit",
              "Spare Part",
              "Consumable",
              "Tool / Equipment",
              "Material / Part",
            ].map((value) => ({
              value,
              label: value,
            }))}
          />
          <Select
            aria-label="Stock status filter"
            value={status}
            onChange={setStatus}
            style={{ width: 150 }}
            options={[
              { value: "ALL", label: "All stock levels" },
              { value: "LOW", label: "Low stock" },
              { value: "OUT", label: "Out of stock" },
            ]}
          />
          <Select
            aria-label="Category filter"
            value={category}
            onChange={setCategory}
            style={{ width: 180 }}
            options={[
              "",
              "Split Type",
              "Window Type",
              "Floor Mounted",
              "Portable",
              "Compressors",
              "Refrigerants",
              "Installation Materials",
              "Copper Tubing",
            ].map((value) => ({ value, label: value || "All categories" }))}
          />
          <Select
            aria-label="Brand filter"
            value={brand}
            onChange={setBrand}
            style={{ width: 150 }}
            options={[
              { value: "", label: "All brands" },
              ...brands.map((entry) => ({
                value: entry.name,
                label: entry.name,
              })),
            ]}
          />
          <Button
            onClick={() => {
              setSearch("");
              setType("ALL");
              setStatus("ALL");
              setCategory("");
              setBrand("");
            }}
          >
            Reset filters
          </Button>
          <span>
            Archived <Switch checked={archived} onChange={setArchived} />
          </span>
          {canManage && (
            <>
              <Button onClick={onNavigateToPostMovement}>Post Movement</Button>
              <Button type="primary" onClick={() => open(null)}>
                Register Item
              </Button>
            </>
          )}
        </Space>
        {archiveError ? (
          <Alert type="error" title={archiveError} />
        ) : (
          <Table
            dataSource={visible}
            columns={columns}
            rowKey="id"
            loading={archiveLoading}
            scroll={{ x: 1000 }}
            pagination={{ defaultPageSize: 10, showSizeChanger: true }}
          />
        )}
      </Card>
      <Modal
        title={
          editing === "new" ? "Register inventory item" : "Edit specifications"
        }
        open={Boolean(editing)}
        onCancel={() => !busy && setEditing(null)}
        footer={null}
        width={700}
      >
        {formError && <Alert type="error" title={formError} />}
        <form onSubmit={submit}>
          <div className="form-grid">
            <label className="field">
              SKU / model
              <Input
                required
                maxLength={100}
                disabled={editing !== "new"}
                value={values.sku}
                onChange={(e) => field("sku", e.target.value)}
              />
            </label>
            <label className="field">
              Item name
              <Input
                required
                maxLength={200}
                value={values.name}
                onChange={(e) => field("name", e.target.value)}
              />
            </label>
            <label className="field">
              Item type
              <Select
                value={values.itemType}
                onChange={(value) =>
                  setValues({
                    ...values,
                    itemType: value,
                    category:
                      value === "AC Unit"
                        ? "Split Type"
                        : value === "Spare Part"
                        ? "Compressors"
                        : value === "Consumable"
                        ? "Refrigerants"
                        : value === "Tool / Equipment"
                        ? "Vacuum Pumps"
                        : "Installation Materials",
                    unitOfMeasure:
                      editing === "new" && value === "AC Unit"
                        ? "UNIT"
                        : values.unitOfMeasure,
                  })
                }
                options={[
                  "AC Unit",
                  "Spare Part",
                  "Consumable",
                  "Tool / Equipment",
                  "Material / Part",
                ].map((value) => ({
                  value,
                  label: value,
                }))}
              />
            </label>
            <label className="field">
              Category
              <Select
                value={values.category}
                onChange={(value) => field("category", value)}
                options={categories.map((value) => ({ value, label: value }))}
              />
            </label>
            <label className="field">
              Brand
              <Select
                showSearch
                value={values.brand}
                onChange={(value) => field("brand", value)}
                options={brands.map((entry) => ({
                  value: entry.name,
                  label: entry.name,
                }))}
              />
            </label>
            <label className="field">
              Capacity / specification
              <Input
                value={values.capacity}
                onChange={(e) => field("capacity", e.target.value)}
                placeholder="e.g. 1.5 HP or 1/4-inch tubing"
              />
            </label>
            <label className="field">
              Supplier / Vendor
              <Input
                value={values.supplier || ""}
                onChange={(e) => field("supplier", e.target.value)}
                placeholder="e.g. Concepcion-Carrier, Chemours"
              />
            </label>
            {values.itemType !== "AC Unit" && (
              <label className="field" style={{ gridColumn: "span 2" }}>
                Compatible AC Unit Models / SKUs
                <Select
                  mode="tags"
                  placeholder="Select or enter compatible AC SKUs/models (e.g. CAR-1.0HP-CRY)"
                  value={values.compatibleModels || []}
                  onChange={(val) => field("compatibleModels", val)}
                  options={items
                    .filter((it) => it.itemType === "AC Unit")
                    .map((it) => ({
                      value: it.sku,
                      label: `${it.sku} — ${it.name}`,
                    }))}
                />
              </label>
            )}
            <label className="field">
              Unit of measure
              <Select
                disabled={editing !== "new" || values.itemType === "AC Unit"}
                value={values.unitOfMeasure}
                onChange={(value) => field("unitOfMeasure", value)}
                options={units.map((value) => ({ value, label: value }))}
              />
            </label>
            <label className="field">
              {editing === "new"
                ? "Opening quantity"
                : "Current stock (read only)"}
              <InputNumber
                min={0}
                step={isContinuousUnit(values.unitOfMeasure) ? 0.1 : 1}
                precision={isContinuousUnit(values.unitOfMeasure) ? 3 : 0}
                disabled={editing !== "new"}
                value={values.quantity}
                onChange={(value) => field("quantity", value)}
                style={{ width: "100%" }}
              />
            </label>
            <label className="field">
              Unit cost (PHP)
              <InputNumber
                min={0}
                precision={2}
                value={values.unitCost}
                onChange={(value) => field("unitCost", value)}
                style={{ width: "100%" }}
              />
            </label>
            <label className="field">
              Selling price (PHP)
              <InputNumber
                min={0}
                precision={2}
                value={values.listPrice}
                onChange={(value) => field("listPrice", value)}
                style={{ width: "100%" }}
              />
            </label>
            <label className="field">
              Reorder level (zero allowed)
              <InputNumber
                min={0}
                step={isContinuousUnit(values.unitOfMeasure) ? 0.1 : 1}
                precision={isContinuousUnit(values.unitOfMeasure) ? 3 : 0}
                value={values.reorderLevel}
                onChange={(value) => field("reorderLevel", value)}
                style={{ width: "100%" }}
              />
            </label>
          </div>
          <Button htmlType="submit" type="primary" loading={busy}>
            Save item
          </Button>
        </form>
        {editing === "new" && (
          <div className="field">
            <span>Missing a brand?</span>
            <Space.Compact>
              <Input
                placeholder="New brand name"
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
              />
              <Button
                disabled={!newBrand.trim() || busy}
                onClick={() => {
                  setBusy(true);
                  save("post", "/brands", { name: newBrand }, "Brand added.")
                    .then(() => setNewBrand(""))
                    .catch((err) => setFormError(errorMessage(err)))
                    .finally(() => setBusy(false));
                }}
              >
                Add brand
              </Button>
            </Space.Compact>
          </div>
        )}
      </Modal>
      <Modal
        title="Item specifications"
        open={Boolean(viewing)}
        onCancel={() => setViewing(null)}
        footer={null}
      >
        {viewing && (
          <Descriptions
            column={1}
            bordered
            items={[
              { key: "sku", label: "SKU", children: viewing.sku },
              { key: "name", label: "Name", children: viewing.name },
              {
                key: "brand",
                label: "Brand / specification",
                children: `${viewing.brand} / ${viewing.capacity || "Not applicable"}`,
              },
              {
                key: "qty",
                label: "Stock",
                children: `${viewing.quantity} ${viewing.unitOfMeasure}`,
              },
              {
                key: "cost",
                label: "Unit cost",
                children: formatMoney(viewing.unitCost),
              },
              {
                key: "price",
                label: "Selling price",
                children: formatMoney(viewing.listPrice),
              },
              {
                key: "supplier",
                label: "Supplier / Vendor",
                children: viewing.supplier || "Not specified",
              },
              ...(Array.isArray(viewing.compatibleModels) &&
              viewing.compatibleModels.length > 0
                ? [
                    {
                      key: "models",
                      label: "Compatible AC Units",
                      children: (
                        <Space wrap>
                          {viewing.compatibleModels.map((m) => (
                            <Tag key={m} color="blue">
                              {m}
                            </Tag>
                          ))}
                        </Space>
                      ),
                    },
                  ]
                : []),
              ...(Array.isArray(viewing.priceHistory) &&
              viewing.priceHistory.length > 0
                ? [
                    {
                      key: "priceHistory",
                      label: "Purchase Cost History",
                      children: (
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                          {viewing.priceHistory.map((ph, idx) => (
                            <li key={idx}>
                              <strong>{formatMoney(ph.cost)}</strong> —{" "}
                              {new Date(ph.date).toLocaleDateString()} (
                              {ph.supplier || "Direct"} · {ph.note || "Logged"})
                            </li>
                          ))}
                        </ul>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        )}
      </Modal>
    </>
  );
}
