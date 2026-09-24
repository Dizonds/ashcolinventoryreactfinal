import React from 'react';
import { formatMoney } from '../utils/formatters';

export default function DashboardPage({ items, movements }) {
  const acUnits = items.filter(({ itemType }) => itemType === 'AC Unit');
  const materials = items.filter(({ itemType }) => itemType !== 'AC Unit');
  const lowStockItems = items.filter(({ quantity, reorderLevel }) => quantity <= reorderLevel);

  const totalValuation = items.reduce((acc, { listPrice, quantity }) => {
    return acc + listPrice * quantity;
  }, 0);

  const totalPhysicalUnits = items.reduce((acc, { quantity }) => acc + quantity, 0);

  const cards = [
    {
      id: 'stat-units',
      title: 'AC Units in Stock',
      subtitle: `${acUnits.length} air conditioner models`,
      value: acUnits.length,
      variant: 'blue',
      icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yKnbVvJgNU/yar91cle_expires_30_days.png',
    },
    {
      id: 'stat-materials',
      title: 'Parts & Supplies',
      subtitle: `${materials.length} spare parts & refrigerants`,
      value: materials.length,
      variant: 'amber',
      icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yKnbVvJgNU/0zk1egwh_expires_30_days.png',
    },
    {
      id: 'stat-low-stock',
      title: 'Restock Warnings',
      subtitle: `${lowStockItems.length} items below minimum level`,
      value: lowStockItems.length,
      variant: 'red',
      icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yKnbVvJgNU/ze8x556n_expires_30_days.png',
    },
    {
      id: 'stat-valuation',
      title: 'Total Stock Valuation',
      subtitle: `${totalPhysicalUnits} total items on hand`,
      value: formatMoney(totalValuation),
      variant: 'green',
      icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/yKnbVvJgNU/xo97mehz_expires_30_days.png',
    },
  ];

  return (
    <div className="main dashboard-page">
      <div className="dashboard-copy">
        <h1>Aircon Inventory Overview</h1>
        <p>Real-time analytics of AC equipment warehouse stock, spare parts replenishment, and valuation.</p>
      </div>

      <div className="dashboard-cards">
        {cards.map((card) => {
          const { id, title, subtitle, value, variant, icon } = card;
          return (
            <div key={id} className={`dashboard-card dashboard-card--${variant}`}>
              <div className="dashboard-card-head">
                <span className="dashboard-card-title">{title}</span>
                <span className="dashboard-card-icon">
                  <img src={icon} alt="" className="dashboard-card-icon-img" />
                </span>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '0.4rem 0' }}>{value}</div>
              <div className="dashboard-card-divider" />
              <div className="dashboard-card-subtitle">{subtitle}</div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="section-head">
          <h2>Low Stock Alert Table</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Item Description</th>
                <th>Type</th>
                <th>Category</th>
                <th>Current Qty</th>
                <th>Min Threshold</th>
                <th>Stock Shortfall</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-muted" style={{ textAlign: 'center', padding: '1.5rem' }}>
                    {items.length === 0
                      ? 'No items currently in inventory.'
                      : 'All items are currently above their reorder thresholds.'}
                  </td>
                </tr>
              ) : (
                lowStockItems.map((item) => {
                  const { id, sku, name, itemType, category, quantity, reorderLevel } = item;
                  const shortfall = reorderLevel - quantity;
                  return (
                    <tr key={id}>
                      <td className="mono">{sku}</td>
                      <td>
                        <strong>{name}</strong>
                      </td>
                      <td>
                        <span className={`badge ${itemType === 'AC Unit' ? 'badge-blue' : 'badge-amber'}`}>
                          {itemType}
                        </span>
                      </td>
                      <td>{category}</td>
                      <td style={{ color: '#ef4444', fontWeight: 'bold' }}>{quantity}</td>
                      <td>{reorderLevel}</td>
                      <td style={{ color: '#ef4444', fontWeight: 'bold' }}>
                        {shortfall > 0 ? `-${shortfall}` : 'At Reorder Level'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
