import React, { useState } from "react";
import { Card, Input, Button, Alert, Typography } from "antd";
import { api, errorMessage } from "../api";

export default function LoginPage({ onLogin, initialError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
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
      <Card style={{ width: 430, maxWidth: "100%" }}>
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
        <Typography.Paragraph type="secondary" style={{ marginTop: 16 }}>
          Ask your inventory administrator for an account. Portal accounts are
          not connected yet.
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
