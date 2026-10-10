import React, { useState } from "react";
import { Card, Input, Button, Alert, Typography } from "antd";
import { ShieldKeyholeBoldDuotoneIcon, UsersGroupTwoRoundedBoldDuotoneIcon, UserBoldDuotoneIcon } from "@solar-icons/react";
import { api, errorMessage } from "../api";

export default function LoginPage({ onLogin, initialError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const defaultAccounts = [
    { fullName: "Admin Master", role: "ADMIN", email: "hatdog@hat.com", password: "hatdog@hat.com" },
    { fullName: "Warehouse Manager", role: "MANAGER", email: "manager@ashcol.com", password: "hatdog@hat.com" },
    { fullName: "Field Technician", role: "EMPLOYEE", email: "technician@ashcol.com", password: "hatdog@hat.com" },
  ];

  const [demoAccounts, setDemoAccounts] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem("ashcol_demo_users") || "[]");
      const map = new Map();
      defaultAccounts.forEach((a) => map.set(a.email, a));
      local.forEach((a) => map.set(a.email, a));
      return Array.from(map.values());
    } catch (e) {
      return defaultAccounts;
    }
  });

  const accountsToDisplay = demoAccounts;

  function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    api("post", "/auth/login", { email: cleanEmail, password: cleanPassword })
      .then(({ data }) => {
        sessionStorage.setItem("ashcol_inventory_token", data.token);
        onLogin(data.user);
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setBusy(false));
  }
  return (
    <div className="login-wrap">
      <Card style={{ width: 440, maxWidth: "100%" }}>
        <Typography.Title level={2}>ASHCOL Inventory</Typography.Title>
        <Typography.Paragraph type="secondary">
          Sign in with your inventory account.
        </Typography.Paragraph>
        {(error || initialError) && (
          <Alert type="error" title={error || initialError} showIcon />
        )}
        <form onSubmit={submit}>
          <label className="field">
            Work email
            <Input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="field">
            Password
            <Input.Password
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <Button type="primary" htmlType="submit" block loading={busy}>
            Sign in
          </Button>
        </form>

        <div style={{ marginTop: 20 }}>
          <Typography.Text
            type="secondary"
            style={{ fontSize: 12, display: "block", marginBottom: 8 }}
          >
            Quick One-Click Demo Fill:
          </Typography.Text>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 8,
            }}
          >
            {accountsToDisplay.map((acc) => {
              const icon =
                acc.role === "ADMIN"
                  ? <ShieldKeyholeBoldDuotoneIcon size={14} style={{ marginRight: 4 }} />
                  : acc.role === "MANAGER"
                    ? <UsersGroupTwoRoundedBoldDuotoneIcon size={14} style={{ marginRight: 4 }} />
                    : <UserBoldDuotoneIcon size={14} style={{ marginRight: 4 }} />;
              return (
                <Button
                  key={acc.email}
                  size="small"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword(acc.password || "hatdog@hat.com");
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center" }}>
                    {icon} {acc.fullName.split(" ")[0]} ({acc.role})
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        <Typography.Paragraph type="secondary" style={{ marginTop: 16 }}>
          Ask your inventory administrator for an account. Portal accounts are
          not connected yet.
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
