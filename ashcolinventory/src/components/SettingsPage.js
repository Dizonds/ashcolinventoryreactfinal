import React, { useState, useEffect } from "react";
import { Card, Input, Select, Button, Table, Alert, Typography, Tag } from "antd";
import { api, errorMessage } from "../api";

export default function SettingsPage({ branches, save, refresh }) {
  const [branch, setBranch] = useState({
    id: "",
    name: "",
    branchType: "WAREHOUSE",
    plateNumber: "",
    driverName: "",
    status: "AVAILABLE",
  });
  const [account, setAccount] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "EMPLOYEE",
    branchId: "",
  });
  const [users, setUsers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api("get", "/users")
      .then(({ data }) => {
        if (active) setUsers(data);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [refresh]);
  function create(event, kind) {
    event.preventDefault();
    setBusy(true);
    setError("");
    save(
      "post",
      kind === "branch" ? "/branches" : "/users",
      kind === "branch" ? branch : account,
      kind === "branch"
        ? branch.branchType === "SERVICE_VAN"
          ? "Service Vehicle added."
          : "Branch added."
        : "Account created.",
    )
      .then(() => {
        if (kind === "user") {
          try {
            const saved = JSON.parse(localStorage.getItem("ashcol_demo_users") || "[]");
            saved.push({
              email: account.email,
              fullName: account.fullName,
              role: account.role,
              password: account.password,
            });
            localStorage.setItem("ashcol_demo_users", JSON.stringify(saved));
          } catch (e) {}
        }
        kind === "branch"
          ? setBranch({
              id: "",
              name: "",
              branchType: "WAREHOUSE",
              plateNumber: "",
              driverName: "",
              status: "AVAILABLE",
            })
          : setAccount({
              email: "",
              password: "",
              fullName: "",
              role: "EMPLOYEE",
              branchId: "",
            });
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setBusy(false));
  }
  function updateVanStatus(vanId, newStatus) {
    setBusy(true);
    api("patch", `/branches/${vanId}/status`, { status: newStatus })
      .then(() => {
        save("get", "/branches", null, "Van status updated.");
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setBusy(false));
  }
  return (
    <>
      <Typography.Title level={3}>Branches & Service Vehicles</Typography.Title>
      <Typography.Paragraph type="secondary">
        ADMIN manages all warehouses, service vehicles, stock transfers, and employee accounts.
        Service Vehicles operate as mobile sub-branches for on-site field maintenance.
      </Typography.Paragraph>
      {error && <Alert type="error" title={error} />}
      <div className="form-grid">
        <Card title="Add Branch or Service Vehicle">
          <form onSubmit={(e) => create(e, "branch")}>
            <label className="field">
              Facility / Branch Type
              <Select
                value={branch.branchType}
                onChange={(val) =>
                  setBranch({
                    ...branch,
                    branchType: val,
                    id:
                      val === "SERVICE_VAN" && !branch.id
                        ? "VAN-"
                        : branch.id,
                  })
                }
                options={[
                  { value: "WAREHOUSE", label: "Fixed Warehouse / Office" },
                  { value: "SERVICE_VAN", label: "Service Vehicle (Mobile Stock)" },
                ]}
              />
            </label>
            <label className="field">
              Branch ID
              <Input
                required
                maxLength={100}
                placeholder={
                  branch.branchType === "SERVICE_VAN"
                    ? "e.g. VAN-01"
                    : "e.g. TAGUIG-MAIN"
                }
                value={branch.id}
                onChange={(e) => setBranch({ ...branch, id: e.target.value })}
              />
            </label>
            <label className="field">
              Facility / Vehicle Name
              <Input
                required
                maxLength={200}
                placeholder={
                  branch.branchType === "SERVICE_VAN"
                    ? "e.g. Field Service Vehicle Alpha"
                    : "e.g. Taguig Central Warehouse"
                }
                value={branch.name}
                onChange={(e) => setBranch({ ...branch, name: e.target.value })}
              />
            </label>
            {branch.branchType === "SERVICE_VAN" && (
              <>
                <label className="field">
                  Vehicle Plate Number
                  <Input
                    placeholder="e.g. NBD-1234"
                    value={branch.plateNumber}
                    onChange={(e) =>
                      setBranch({ ...branch, plateNumber: e.target.value })
                    }
                  />
                </label>
                <label className="field">
                  Assigned Lead Driver / Technician
                  <Select
                    showSearch
                    allowClear
                    placeholder="Select lead technician (optional)"
                    value={branch.driverName || undefined}
                    onChange={(val) =>
                      setBranch({ ...branch, driverName: val || "" })
                    }
                    options={users.map((u) => ({
                      value: `${u.fullName} (${u.role})`,
                      label: `${u.fullName} (${u.role})`,
                    }))}
                  />
                </label>
              </>
            )}
            <Button type="primary" htmlType="submit" loading={busy}>
              {branch.branchType === "SERVICE_VAN"
                ? "Register Service Vehicle"
                : "Add Branch"}
            </Button>
          </form>
          <div style={{ marginTop: 20 }}>
            <strong>🏢 Physical Warehouses & Branches</strong>
            <Table
              size="small"
              rowKey="id"
              style={{ marginTop: 8 }}
              dataSource={branches.filter((b) => b.branchType !== "SERVICE_VAN")}
              pagination={false}
              columns={[
                { title: "Branch ID", dataIndex: "id" },
                { title: "Warehouse Name", dataIndex: "name" },
                {
                  title: "Type",
                  render: () => <Tag color="blue">🏢 Warehouse</Tag>,
                },
                {
                  title: "Status",
                  render: () => <Tag color="green">Active</Tag>,
                },
              ]}
            />
          </div>

          <div style={{ marginTop: 24 }}>
            <strong>🚐 Mobile Service Vehicles Fleet</strong>
            <Table
              size="small"
              rowKey="id"
              style={{ marginTop: 8 }}
              dataSource={branches.filter((b) => b.branchType === "SERVICE_VAN")}
              pagination={false}
              columns={[
                { title: "Vehicle Code", dataIndex: "id" },
                { title: "Vehicle Name", dataIndex: "name" },
                {
                  title: "Plate Number",
                  render: (_, item) => <strong>{item.plateNumber || "N/A"}</strong>,
                },
                {
                  title: "Assigned Lead Driver",
                  render: (_, item) =>
                    item.driverName ? (
                      <span style={{ color: "#1d4ed8", fontWeight: 500 }}>
                        👤 {item.driverName}
                      </span>
                    ) : (
                      <span style={{ color: "#9ca3af", fontStyle: "italic" }}>
                        Unassigned (Required for field trips)
                      </span>
                    ),
                },
                {
                  title: "Fleet Status",
                  render: (_, item) => {
                    const currentStatus = item.status || "AVAILABLE";
                    return (
                      <Select
                        size="small"
                        value={currentStatus}
                        onChange={(val) => updateVanStatus(item.id, val)}
                        style={{ minWidth: 150 }}
                        options={[
                          { value: "AVAILABLE", label: "🟢 Available / Base" },
                          { value: "ON_FIELD", label: "🔵 En Route / On Field" },
                          { value: "ARRIVED", label: "📍 Arrived at Site" },
                          { value: "MAINTENANCE", label: "🟠 In Maintenance" },
                        ]}
                      />
                    );
                  },
                },
              ]}
            />
          </div>
        </Card>
        <Card title="Create account">
          <form onSubmit={(e) => create(e, "user")}>
            <label className="field">
              Full name
              <Input
                required
                value={account.fullName}
                onChange={(e) =>
                  setAccount({ ...account, fullName: e.target.value })
                }
              />
            </label>
            <label className="field">
              Email
              <Input
                type="email"
                required
                value={account.email}
                onChange={(e) =>
                  setAccount({ ...account, email: e.target.value })
                }
              />
            </label>
            <label className="field">
              Password (at least 10 characters)
              <Input.Password
                required
                minLength={10}
                autoComplete="new-password"
                value={account.password}
                onChange={(e) =>
                  setAccount({ ...account, password: e.target.value })
                }
              />
            </label>
            <label className="field">
              Role
              <Select
                value={account.role}
                onChange={(value) => setAccount({ ...account, role: value })}
                options={["EMPLOYEE", "MANAGER", "ADMIN"].map((value) => ({
                  value,
                  label: value,
                }))}
              />
            </label>
            <label className="field">
              Assigned branch / warehouse
              <Select
                value={account.branchId || undefined}
                onChange={(value) =>
                  setAccount({ ...account, branchId: value })
                }
                options={branches
                  .filter((entry) => entry.branchType !== "SERVICE_VAN")
                  .map((entry) => ({
                    value: entry.id,
                    label: `🏢 ${entry.name} (${entry.id})`,
                  }))}
              />
            </label>
            <Button
              type="primary"
              htmlType="submit"
              loading={busy}
              disabled={!account.branchId}
            >
              Create account
            </Button>
          </form>
        </Card>
      </div>
      <Card title="Inventory accounts & Employees" style={{ marginTop: 20 }}>
        <Table
          rowKey="id"
          dataSource={users}
          scroll={{ x: 600 }}
          columns={[
            {
              title: "Full Name",
              dataIndex: "fullName",
              render: (name) => <strong>{name}</strong>,
            },
            { title: "Email", dataIndex: "email" },
            {
              title: "System Role",
              dataIndex: "role",
              render: (role) => (
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    background:
                      role === "ADMIN"
                        ? "#f6ffed"
                        : role === "MANAGER"
                        ? "#e6f4ff"
                        : "#f5f5f5",
                    color:
                      role === "ADMIN"
                        ? "#389e0d"
                        : role === "MANAGER"
                        ? "#0958d9"
                        : "#595959",
                    border: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  {role}
                </span>
              ),
            },
            {
              title: "Assigned Facility / Van",
              dataIndex: "branchId",
              render: (id) => {
                const b = branches.find((branch) => branch.id === id);
                return b ? (
                  <span>
                    {b.branchType === "SERVICE_VAN" ? "🚐 " : "🏢 "}
                    {b.name} ({id})
                  </span>
                ) : (
                  id
                );
              },
            },
          ]}
        />
      </Card>
    </>
  );
}
