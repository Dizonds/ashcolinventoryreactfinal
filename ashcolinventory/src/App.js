import React, { useState, useEffect } from "react";
import {
  ConfigProvider,
  theme,
  Alert,
  Button,
  Select,
  Space,
  Spin,
} from "antd";
import { api, errorMessage } from "./api";
import LoginPage from "./components/LoginPage";
import DashboardPage from "./components/DashboardPage";
import InventorySection from "./components/InventorySection";
import PostMovementPage from "./components/PostMovementPage";
import MovementsPage from "./components/MovementsPage";
import RequestsPage from "./components/RequestsPage";
import SettingsPage from "./components/SettingsPage";
import CompatibilityLookupPage from "./components/CompatibilityLookupPage";
import SuppliersPage from "./components/SuppliersPage";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [items, setItems] = useState([]);
  const [brands, setBrands] = useState([]);
  const [requests, setRequests] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [targetId, setTargetId] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState(null);
  const [isDark, setIsDark] = useState(
    localStorage.getItem("ashcol_theme") === "dark",
  );
  const canManage = user && user.role !== "EMPLOYEE";

  useEffect(() => {
    let active = true;
    if (!sessionStorage.getItem("ashcol_inventory_token")) {
      setChecking(false);
      return;
    }
    api("get", "/auth/me")
      .then(({ data }) => {
        if (active) setUser(data);
      })
      .catch((err) => {
        if (active) {
          if (err.response && err.response.status === 401)
            sessionStorage.removeItem("ashcol_inventory_token");
          setError(errorMessage(err));
        }
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    api("get", "/branches")
      .then(({ data }) => {
        if (active) {
          setBranches(data);
          setBranchId((current) => current || user.branchId);
        }
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [user, refresh]);

  useEffect(() => {
    if (!user || !branchId) return;
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([
      api("get", "/products", null, { branchId }),
      api("get", "/brands"),
      api("get", "/requests", null, { branchId }),
    ])
      .then(([stock, brandList, requestList]) => {
        if (active) {
          setItems(stock.data);
          setBrands(brandList.data);
          setRequests(requestList.data);
        }
      })
      .catch((err) => {
        if (active) {
          setItems([]);
          setRequests([]);
          setError(errorMessage(err));
          if (err.response && err.response.status === 401) {
            sessionStorage.removeItem("ashcol_inventory_token");
            setUser(null);
          }
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, branchId, refresh]);

  function save(method, path, data, success, params) {
    return api(method, path, data, params)
      .then((response) => {
        setRefresh((value) => value + 1);
        setNotice({ type: "success", text: success });
        return response.data;
      })
      .catch((err) => {
        setNotice({ type: "error", text: errorMessage(err) });
        if (err.response && err.response.status === 401) {
          sessionStorage.removeItem("ashcol_inventory_token");
          setUser(null);
        }
        throw err;
      });
  }
  function logout() {
    api("post", "/auth/logout")
      .then(() => {
        sessionStorage.removeItem("ashcol_inventory_token");
        setUser(null);
        setBranchId("");
        setItems([]);
        setRequests([]);
        setBranches([]);
        setError("");
        setNotice(null);
        setPage("dashboard");
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          sessionStorage.removeItem("ashcol_inventory_token");
          setUser(null);
          setBranchId("");
        } else setNotice({ type: "error", text: errorMessage(err) });
      });
  }
  const navigation = [
    { id: "dashboard", label: "Overview" },
    { id: "inventory", label: "Inventory Catalog" },
    { id: "compatibility", label: "Model Matching" },
    { id: "suppliers", label: "Suppliers & Vendors" },
    { id: "requests", label: "Material Requests" },
    ...(canManage ? [{ id: "post_movement", label: "Post Movement" }] : []),
    { id: "movements", label: "Stock Ledger" },
    ...(user && user.role === "ADMIN"
      ? [{ id: "settings", label: "Branches & Accounts" }]
      : []),
  ];
  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { colorPrimary: "#059669", borderRadius: 8 },
      }}
    >
      <div className={isDark ? "inventory-app dark" : "inventory-app"}>
        {checking ? (
          <div className="login-wrap">
            <Spin description="Checking session">
              <div style={{ padding: 40 }} />
            </Spin>
          </div>
        ) : !user ? (
          <LoginPage
            initialError={error}
            onLogin={(account) => {
              setError("");
              setUser(account);
              setBranchId(account.branchId);
              setPage("dashboard");
            }}
          />
        ) : (
          <>
            <header className="app-header">
              <Space>
                <img
                  src="/assets/ash-logo.jpg"
                  alt="ASHCOL"
                  width="44"
                  height="44"
                />
                <div>
                  <strong>ASHCOL Inventory</strong>
                  <div>Branch stock & service materials</div>
                </div>
              </Space>
              <Space wrap>
                <span>
                  {user.fullName} · {user.role}
                </span>
                <Button
                  onClick={() => {
                    setIsDark(!isDark);
                    localStorage.setItem(
                      "ashcol_theme",
                      isDark ? "light" : "dark",
                    );
                  }}
                >
                  {isDark ? "Light" : "Dark"} theme
                </Button>
                <Button onClick={logout}>Log out</Button>
              </Space>
            </header>
            <div className="app-body">
              <nav className="app-nav" aria-label="Inventory navigation">
                {navigation.map((entry) => (
                  <Button
                    key={entry.id}
                    type={page === entry.id ? "primary" : "text"}
                    onClick={() => setPage(entry.id)}
                  >
                    {entry.label}
                  </Button>
                ))}
              </nav>
              <main>
                <div className="branch-toolbar">
                  <Space wrap>
                    <strong>Branch</strong>
                    <Select
                      aria-label="Current branch"
                      value={branchId || undefined}
                      style={{ minWidth: 240 }}
                      disabled={user.role !== "ADMIN"}
                      options={branches.map((branch) => ({
                        value: branch.id,
                        label: `${branch.branchType === "SERVICE_VAN" ? "🚐 " : "🏢 "}${branch.name} (${branch.id})`,
                      }))}
                      onChange={(value) => {
                        setBranchId(value);
                        setItems([]);
                        setRequests([]);
                        setTargetId("");
                      }}
                    />
                  </Space>
                  <Button
                    loading={loading}
                    onClick={() => setRefresh(refresh + 1)}
                  >
                    Refresh
                  </Button>
                </div>
                {error && (
                  <Alert
                    type="error"
                    showIcon
                    title="Inventory could not be loaded"
                    description={error}
                    style={{ marginBottom: 16 }}
                  />
                )}
                {notice && (
                  <Alert
                    type={notice.type}
                    title={notice.text}
                    showIcon
                    closable
                    onClose={() => setNotice(null)}
                    style={{ marginBottom: 16 }}
                  />
                )}
                <Spin spinning={loading}>
                  {!error && branchId && (
                    <div key={branchId}>
                      {page === "dashboard" && (
                        <DashboardPage
                          items={items}
                          requests={requests}
                          branchId={branchId}
                          canManage={canManage}
                          onRestockItem={(id) => {
                            setTargetId(id);
                            setPage("post_movement");
                          }}
                          onNavigateToInventoryWithFilter={(filter) => {
                            setInventoryFilter(filter);
                            setPage("inventory");
                          }}
                        />
                      )}
                      {page === "inventory" && (
                        <InventorySection
                          items={items}
                          brands={brands}
                          user={user}
                          branchId={branchId}
                          save={save}
                          preselectedFilter={inventoryFilter}
                          onNavigateToPostMovement={() => {
                            setTargetId("");
                            setPage("post_movement");
                          }}
                        />
                      )}
                      {page === "compatibility" && (
                        <CompatibilityLookupPage
                          items={items}
                          onNavigateToItem={(id) => {
                            setPage("inventory");
                          }}
                        />
                      )}
                      {page === "suppliers" && (
                        <SuppliersPage
                          user={user}
                          save={save}
                          refresh={refresh}
                        />
                      )}
                      {page === "requests" && (
                        <RequestsPage
                          items={items}
                          requests={requests}
                          user={user}
                          branchId={branchId}
                          save={save}
                        />
                      )}
                      {page === "post_movement" && canManage && (
                        <PostMovementPage
                          items={items}
                          branches={branches}
                          branchId={branchId}
                          user={user}
                          save={save}
                          preselectedItemId={targetId}
                        />
                      )}
                      {page === "movements" && (
                        <MovementsPage branchId={branchId} refresh={refresh} />
                      )}
                      {page === "settings" && user.role === "ADMIN" && (
                        <SettingsPage
                          branches={branches}
                          save={save}
                          refresh={refresh}
                        />
                      )}
                    </div>
                  )}
                </Spin>
              </main>
            </div>
          </>
        )}
      </div>
    </ConfigProvider>
  );
}
