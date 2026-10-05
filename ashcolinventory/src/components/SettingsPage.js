import React, { useState, useEffect } from "react";
import { Card, Input, Select, Button, Table, Alert, Typography } from "antd";
import { api, errorMessage } from "../api";

export default function SettingsPage({ branches, save, refresh }) {
  const [branch, setBranch] = useState({
    id: "",
    name: "",
    branchType: "WAREHOUSE",
    plateNumber: "",
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
          ? "Service Van added."
          : "Branch added."
        : "Account created.",
    )
      .then(() =>
        kind === "branch"
          ? setBranch({
              id: "",
              name: "",
              branchType: "WAREHOUSE",
              plateNumber: "",
              status: "AVAILABLE",
            })
          : setAccount({
              email: "",
              password: "",
              fullName: "",
              role: "EMPLOYEE",
              branchId: "",
            }),
      )
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
      <Typography.Title level={3}>Branches & Service Vans</Typography.Title>
      <Typography.Paragraph type="secondary">
        ADMIN manages all warehouses, service vans, stock transfers, and employee accounts.
        Service Vans operate as mobile sub-branches for on-site field maintenance.
      </Typography.Paragraph>
      {error && <Alert type="error" title={error} />}
      <div className="form-grid">
        <Card title="Add Branch or Service Van">
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
                  { value: "SERVICE_VAN", label: "Service Van (Mobile Stock)" },
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
              Facility / Van Name
              <Input
                required
                maxLength={200}
                placeholder={
                  branch.branchType === "SERVICE_VAN"
                    ? "e.g. Field Service Van Alpha"
                    : "e.g. Taguig Central Warehouse"
                }
                value={branch.name}
                onChange={(e) => setBranch({ ...branch, name: e.target.value })}
              />
            </label>
            {branch.branchType === "SERVICE_VAN" && (
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
            )}
            <Button type="primary" htmlType="submit" loading={busy}>
              {branch.branchType === "SERVICE_VAN"
                ? "Register Service Van"
                : "Add Branch"}
            </Button>
          </form>
          <Table
            size="small"
            rowKey="id"
            dataSource={branches}
            columns={[
              { title: "ID", dataIndex: "id" },
              { title: "Name", dataIndex: "name" },
              {
                title: "Type",
                render: (_, item) =>
                  item.branchType === "SERVICE_VAN" ? (
                    <span style={{ color: "#0958d9", fontWeight: 600 }}>
                      🚐 Van {item.plateNumber ? `(${item.plateNumber})` : ""}
                    </span>
                  ) : (
                    <span>🏢 Warehouse</span>
                  ),
              },
              {
                title: "Status",
                render: (_, item) => {
                  if (item.branchType !== "SERVICE_VAN") return "Active";
                  const currentStatus = item.status || "AVAILABLE";
                  return (
                    <Select
                      size="small"
                      value={currentStatus}
                      onChange={(val) => updateVanStatus(item.id, val)}
                      style={{ width: 120 }}
                      options={[
                        { value: "AVAILABLE", label: "🟢 Available" },
                        { value: "ON_FIELD", label: "🔵 On Field" },
                        { value: "MAINTENANCE", label: "🟠 In Repair" },
                      ]}
                    />
                  );
                },
              },
            ]}
            style={{ marginTop: 20 }}
          />
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
              Assigned branch
              <Select
                value={account.branchId || undefined}
                onChange={(value) =>
                  setAccount({ ...account, branchId: value })
                }
                options={branches.map((entry) => ({
                  value: entry.id,
                  label: entry.name,
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
