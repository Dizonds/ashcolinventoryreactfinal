import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Input,
  Typography,
  Alert,
} from "antd";
import { api, errorMessage } from "../api";

export default function SuppliersPage({ user, save, refresh }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    terms: "30 Days Net",
  });

  const canManage = user && user.role !== "EMPLOYEE";

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api("get", "/suppliers")
      .then(({ data }) => {
        if (active) setSuppliers(data);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refresh]);

  function handleOpen(supplier) {
    if (supplier) {
      setFormData({
        name: supplier.name || "",
        contactPerson: supplier.contactPerson || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        address: supplier.address || "",
        terms: supplier.terms || "30 Days Net",
      });
    } else {
      setFormData({
        name: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
        terms: "30 Days Net",
      });
    }
    setFormError("");
    setModalOpen(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setFormError("");
    save("post", "/suppliers", formData, "Supplier saved.")
      .then(() => setModalOpen(false))
      .catch((err) => setFormError(errorMessage(err)))
      .finally(() => setBusy(false));
  }

  const visibleSuppliers = suppliers.filter((s) => {
    const text = `${s.name} ${s.contactPerson} ${s.email} ${s.phone}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const columns = [
    {
      title: "Supplier Name",
      dataIndex: "name",
      render: (name) => <strong>{name}</strong>,
    },
    {
      title: "Contact Person",
      dataIndex: "contactPerson",
      render: (cp) => cp || "—",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      render: (ph) => ph || "—",
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (em) => em || "—",
    },
    {
      title: "Payment Terms",
      dataIndex: "terms",
      render: (terms) => terms || "—",
    },
    {
      title: "Address",
      dataIndex: "address",
      render: (addr) => addr || "—",
    },
    ...(canManage
      ? [
          {
            title: "Actions",
            render: (_, item) => (
              <Button size="small" onClick={() => handleOpen(item)}>
                Edit
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <Typography.Title level={3}>Suppliers & Vendors</Typography.Title>
      <Typography.Paragraph type="secondary">
        Authorized HVAC distributors, equipment suppliers, and parts vendors.
      </Typography.Paragraph>

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          style={{ marginBottom: 16 }}
        />
      )}

      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <Input
            placeholder="Search suppliers by name, contact or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 350 }}
            allowClear
          />
          {canManage && (
            <Button type="primary" onClick={() => handleOpen(null)}>
              Register Supplier
            </Button>
          )}
        </div>

        <Table
          rowKey="id"
          dataSource={visibleSuppliers}
          columns={columns}
          loading={loading}
          scroll={{ x: 750 }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={formData.name ? "Edit Supplier Record" : "Register New Supplier"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        {formError && (
          <Alert
            type="error"
            showIcon
            message={formError}
            style={{ marginBottom: 16 }}
          />
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field">
              Supplier / Company Name
              <Input
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Concepcion-Carrier Air Conditioning Co."
              />
            </label>
            <label className="field">
              Contact Person / Sales Agent
              <Input
                value={formData.contactPerson}
                onChange={(e) =>
                  setFormData({ ...formData, contactPerson: e.target.value })
                }
                placeholder="e.g. Juan dela Cruz"
              />
            </label>
            <label className="field">
              Contact Phone
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="e.g. +63 2 8888 1234"
              />
            </label>
            <label className="field">
              Email Address
              <Input
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="sales@supplier.com.ph"
              />
            </label>
            <label className="field">
              Payment Terms
              <Input
                value={formData.terms}
                onChange={(e) =>
                  setFormData({ ...formData, terms: e.target.value })
                }
                placeholder="e.g. 30 Days Net, COD, PDC"
              />
            </label>
            <label className="field">
              Address / Warehouse Location
              <Input
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="e.g. Pasig City, Metro Manila"
              />
            </label>
          </div>
          <Button
            type="primary"
            htmlType="submit"
            loading={busy}
            style={{ marginTop: 16 }}
          >
            Save Supplier
          </Button>
        </form>
      </Modal>
    </>
  );
}
