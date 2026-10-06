import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Input,
  Select,
  Table,
  Tag,
  Typography,
} from "antd";
import { api, errorMessage } from "../api";

const emptyBranch = { id: "", name: "", branchType: "WAREHOUSE" };
const emptyAccount = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "EMPLOYEE",
  branchId: "",
};

function clean(value) {
  return value.trim().replace(/\s+/g, " ");
}

function nameIsValid(value) {
  return /^[\p{L}][\p{L} .'-]{1,49}$/u.test(clean(value));
}

export default function SettingsPage({ section = "branches", branches, save, refresh }) {
  const [branch, setBranch] = useState(emptyBranch);
  const [account, setAccount] = useState(emptyAccount);
  const [users, setUsers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (section !== "users") return undefined;
    let active = true;
    api("get", "/users")
      .then(({ data }) => active && setUsers(data))
      .catch((err) => active && setError(errorMessage(err)));
    return () => {
      active = false;
    };
  }, [section, refresh]);

  function createBranch(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    save(
      "post",
      "/branches",
      { ...branch, id: clean(branch.id).toUpperCase(), name: clean(branch.name) },
      "Branch added.",
    )
      .then(() => setBranch(emptyBranch))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setBusy(false));
  }

  function validateAccount() {
    const firstName = clean(account.firstName);
    const lastName = clean(account.lastName);
    const email = clean(account.email).toLowerCase();
    if (!nameIsValid(firstName)) return "Enter a valid first name (2-50 letters).";
    if (!nameIsValid(lastName)) return "Enter a valid last name (2-50 letters).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Enter a valid work email address.";
    if (account.password.length < 10)
      return "Password must contain at least 10 characters.";
    if (!/[A-Z]/.test(account.password) || !/[a-z]/.test(account.password))
      return "Password must contain at least one uppercase and one lowercase letter.";
    if (!/\d/.test(account.password))
      return "Password must contain at least one number.";
    if (account.password !== account.confirmPassword) return "Passwords do not match.";
    if (!account.branchId) return "Assign the account to a branch.";
    return "";
  }

  function createAccount(event) {
    event.preventDefault();
    const validationError = validateAccount();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setBusy(true);
    setError("");
    setFormError("");
    save(
      "post",
      "/users",
      {
        firstName: clean(account.firstName),
        lastName: clean(account.lastName),
        email: clean(account.email).toLowerCase(),
        password: account.password,
        role: account.role,
        branchId: account.branchId,
      },
      "User account created.",
    )
      .then(() => setAccount(emptyAccount))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setBusy(false));
  }

  if (section === "users") {
    return (
      <>
        <Typography.Title level={3}>User Management</Typography.Title>
        <Typography.Paragraph type="secondary">
          Create and review authenticated inventory accounts. Assign the least-privileged
          role and attach every user to their primary branch.
        </Typography.Paragraph>
        {error && <Alert type="error" title={error} showIcon />}
        {formError && <Alert type="warning" title={formError} showIcon style={{ marginTop: 12 }} />}
        <Card title="Create User Account" style={{ marginTop: 16 }}>
          <form onSubmit={createAccount}>
            <div className="form-grid">
              <label className="field">
                First name
                <Input required maxLength={50} placeholder="e.g. Juan" value={account.firstName} onChange={(e) => setAccount({ ...account, firstName: e.target.value })} />
              </label>
              <label className="field">
                Last name
                <Input required maxLength={50} placeholder="e.g. Dela Cruz" value={account.lastName} onChange={(e) => setAccount({ ...account, lastName: e.target.value })} />
              </label>
              <label className="field">
                Work email address
                <Input required type="email" maxLength={200} autoComplete="email" placeholder="name@ashcol.com" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} />
              </label>
              <label className="field">
                Account role
                <Select
                  value={account.role}
                  onChange={(role) => setAccount({ ...account, role })}
                  options={[
                    { value: "EMPLOYEE", label: "Employee — view and request materials" },
                    { value: "MANAGER", label: "Manager — manage assigned branch" },
                    { value: "ADMIN", label: "Administrator — manage the whole system" },
                  ]}
                />
              </label>
              <label className="field">
                Assigned branch
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="Select a warehouse or branch"
                  value={account.branchId || undefined}
                  onChange={(branchId) => setAccount({ ...account, branchId })}
                  options={branches.filter((entry) => entry.branchType !== "SERVICE_VAN").map((entry) => ({ value: entry.id, label: `${entry.name} (${entry.id})` }))}
                />
              </label>
              <div className="field" />
              <label className="field">
                Temporary password
                <Input.Password required minLength={10} autoComplete="new-password" placeholder="At least 10 characters" value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} />
                <small>Use uppercase, lowercase, and a number.</small>
              </label>
              <label className="field">
                Confirm password
                <Input.Password required minLength={10} autoComplete="new-password" placeholder="Re-enter temporary password" value={account.confirmPassword} onChange={(e) => setAccount({ ...account, confirmPassword: e.target.value })} />
              </label>
            </div>
            <Button type="primary" htmlType="submit" loading={busy} style={{ marginTop: 8 }}>
              Create User Account
            </Button>
          </form>
        </Card>
        <Card title="Registered User Accounts" style={{ marginTop: 20 }}>
          <Table
            rowKey="id"
            dataSource={users}
            scroll={{ x: 700 }}
            columns={[
              { title: "Name", render: (_, user) => <strong>{user.fullName || `${user.firstName} ${user.lastName}`}</strong> },
              { title: "Email", dataIndex: "email" },
              { title: "Role", dataIndex: "role", render: (role) => <Tag color={role === "ADMIN" ? "green" : role === "MANAGER" ? "blue" : "default"}>{role}</Tag> },
              {
                title: "Assigned Branch",
                dataIndex: "branchId",
                render: (id) => {
                  const selected = branches.find((entry) => entry.id === id);
                  return selected ? `${selected.name} (${id})` : id;
                },
              },
            ]}
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <Typography.Title level={3}>Branches</Typography.Title>
      <Typography.Paragraph type="secondary">
        Manage fixed warehouses and branch locations. Service vehicles are managed separately
        in the Service Vehicles tab and are not mixed with permanent branch records.
      </Typography.Paragraph>
      {error && <Alert type="error" title={error} showIcon />}
      <Card title="Register Branch" style={{ marginTop: 16 }}>
        <form onSubmit={createBranch}>
          <div className="form-grid">
            <label className="field">
              Branch ID
              <Input required maxLength={100} placeholder="e.g. TAGUIG-MAIN" value={branch.id} onChange={(e) => setBranch({ ...branch, id: e.target.value })} />
              <small>Use letters, numbers, and hyphens only.</small>
            </label>
            <label className="field">
              Branch name
              <Input required maxLength={200} placeholder="e.g. Taguig Central Warehouse" value={branch.name} onChange={(e) => setBranch({ ...branch, name: e.target.value })} />
            </label>
          </div>
          <Button type="primary" htmlType="submit" loading={busy} style={{ marginTop: 8 }}>Add Branch</Button>
        </form>
      </Card>
      <Card title="Registered Branches" style={{ marginTop: 20 }}>
        <Table
          size="small"
          rowKey="id"
          dataSource={branches.filter((entry) => entry.branchType !== "SERVICE_VAN")}
          pagination={false}
          columns={[
            { title: "Branch ID", dataIndex: "id" },
            { title: "Branch Name", dataIndex: "name" },
            { title: "Type", render: () => <Tag color="blue">Warehouse / Branch</Tag> },
            { title: "Status", render: () => <Tag color="green">Active</Tag> },
          ]}
        />
      </Card>
    </>
  );
}
