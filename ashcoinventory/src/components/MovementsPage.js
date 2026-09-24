import React from 'react';

export default function MovementsPage({ movements }) {
  return (
    <div className="main">
      <div className="dashboard-copy">
        <h1>Stock Movements Ledger</h1>
        <p>Complete audit trail of deliveries (Stock In) and warehouse dispatches (Stock Out).</p>
      </div>

      <div className="sales-orders-frame">
        <div className="sales-orders-toolbar">
          <div className="sales-orders-heading">
            <h2>Movement Records ({movements.length})</h2>
          </div>
        </div>

        <div className="sales-orders-table-shell">
          <table className="sales-orders-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>SKU</th>
                <th>ITEM NAME</th>
                <th>MOVEMENT TYPE</th>
                <th>QUANTITY</th>
                <th>REASON / NOTES</th>
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 ? (
                <tr>
                  <td colSpan="6" className="sales-orders-empty">
                    No stock movements logged yet. Any item addition or stock adjustment will automatically appear here!
                  </td>
                </tr>
              ) : (
                movements.map((m) => {
                  const { id, date, sku, itemName, movementType, quantityDelta, reason } = m;
                  const isStockIn = movementType === 'STOCK_IN' || quantityDelta > 0;

                  return (
                    <tr key={id}>
                      <td className="sales-orders-date">{date}</td>
                      <td className="mono">{sku}</td>
                      <td><strong>{itemName}</strong></td>
                      <td>
                        <span className={`badge ${isStockIn ? 'badge-green' : 'badge-amber'}`}>
                          {isStockIn ? 'STOCK IN' : 'STOCK OUT'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 'bold', color: isStockIn ? '#059669' : '#dc2626' }}>
                        {quantityDelta > 0 ? `+${quantityDelta}` : quantityDelta}
                      </td>
                      <td>{reason}</td>
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
