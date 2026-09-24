import React, { useState } from 'react';
import { formatMoney } from '../utils/formatters';

export default function PostMovementPage({ items, onAdjustStock }) {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [movementType, setMovementType] = useState('STOCK_IN');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('Supplier Delivery');
  const [customReason, setCustomReason] = useState('');

  const matchingItems = items.filter(({ id }) => id === selectedItemId);
  const selectedItem = matchingItems.length > 0 ? matchingItems[0] : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = Number(quantity);

    if (!selectedItemId) {
      alert('Please select an inventory item!');
      return;
    }

    if (!qty || qty <= 0) {
      alert('Please enter a valid quantity greater than 0!');
      return;
    }

    if (movementType === 'STOCK_OUT' && selectedItem && qty > selectedItem.quantity) {
      alert(`Cannot dispatch ${qty} units. Only ${selectedItem.quantity} units currently in warehouse!`);
      return;
    }

    const delta = movementType === 'STOCK_IN' ? qty : -qty;
    const finalReason = reason === 'Other' ? customReason || 'Manual Adjustment' : reason;

    onAdjustStock(selectedItemId, delta, finalReason);

    setQuantity('');
    setCustomReason('');
  };

  return (
    <div className="main">
      <div className="dashboard-copy">
        <h1>Post Stock Movement</h1>
        <p>Record warehouse replenishment deliveries (Stock In) or field dispatches and sales (Stock Out).</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-head">
            <h2>Stock Transaction Form</h2>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field">
              <label>Movement Type</label>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  className={`btn ${movementType === 'STOCK_IN' ? 'btn-success' : 'btn-ghost'}`}
                  style={{
                    flex: 1,
                    backgroundColor: movementType === 'STOCK_IN' ? '#059669' : 'transparent',
                    color: movementType === 'STOCK_IN' ? '#fff' : 'inherit',
                    borderColor: '#059669',
                    padding: '0.7rem',
                  }}
                  onClick={() => {
                    setMovementType('STOCK_IN');
                    setReason('Supplier Delivery');
                  }}
                >
                  ⬇️ Stock In (Delivery / Restock)
                </button>
                <button
                  type="button"
                  className={`btn ${movementType === 'STOCK_OUT' ? 'btn-danger' : 'btn-ghost'}`}
                  style={{
                    flex: 1,
                    backgroundColor: movementType === 'STOCK_OUT' ? '#dc2626' : 'transparent',
                    color: movementType === 'STOCK_OUT' ? '#fff' : 'inherit',
                    borderColor: '#dc2626',
                    padding: '0.7rem',
                  }}
                  onClick={() => {
                    setMovementType('STOCK_OUT');
                    setReason('Client Installation');
                  }}
                >
                  ⬆️ Stock Out (Dispatch / Usage)
                </button>
              </div>
            </div>

            <label>
              Select AC Unit or Material
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                required
              >
                <option value="">-- Choose item from inventory --</option>
                {items.map((item) => {
                  const { id, sku, name, itemType, quantity: q, unitOfMeasure } = item;
                  return (
                    <option key={id} value={id}>
                      [{itemType}] {sku} — {name} ({q} {unitOfMeasure || 'units'} on hand)
                    </option>
                  );
                })}
              </select>
            </label>

            <label>
              Quantity to {movementType === 'STOCK_IN' ? 'Add' : 'Deduct'}
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 5"
                required
              />
            </label>

            <label>
              Transaction Reference / Reason
              <select value={reason} onChange={(e) => setReason(e.target.value)}>
                {movementType === 'STOCK_IN' ? (
                  <>
                    <option value="Supplier Delivery">Supplier Delivery / Restock</option>
                    <option value="Customer Return">Customer Return / Exchange</option>
                    <option value="Warehouse Transfer In">Warehouse Transfer In</option>
                    <option value="Audit Correction (Surplus)">Audit Correction (Surplus)</option>
                    <option value="Other">Other (Specify below)</option>
                  </>
                ) : (
                  <>
                    <option value="Client Installation">Client Installation / Job Site</option>
                    <option value="Sales Order Outbound">Sales Order Outbound</option>
                    <option value="Damaged / Defective Write-off">Damaged / Defective Write-off</option>
                    <option value="Warehouse Transfer Out">Warehouse Transfer Out</option>
                    <option value="Other">Other (Specify below)</option>
                  </>
                )}
              </select>
            </label>

            {reason === 'Other' && (
              <label>
                Custom Reason Notes
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Enter details..."
                  required
                />
              </label>
            )}

            <button
              className="btn"
              type="submit"
              style={{
                backgroundColor: movementType === 'STOCK_IN' ? '#059669' : '#dc2626',
                borderColor: movementType === 'STOCK_IN' ? '#059669' : '#dc2626',
                color: '#fff',
                marginTop: '0.5rem',
              }}
            >
              Post {movementType === 'STOCK_IN' ? 'Stock In (+)' : 'Stock Out (-)'} Movement
            </button>
          </form>
        </div>

        <div className="card">
          <div className="section-head">
            <h2>Transaction Summary Preview</h2>
          </div>

          {!selectedItem ? (
            <p className="text-muted" style={{ padding: '1rem 0' }}>
              Select an item in the form to view real-time stock impact calculations.
            </p>
          ) : (
            <div className="detail-panel">
              <h3>{selectedItem.name}</h3>
              <p className="mono" style={{ color: 'var(--text-muted, #64748b)' }}>
                SKU: {selectedItem.sku} · Type: {selectedItem.itemType} · Brand: {selectedItem.brand}
              </p>

              <div className="responsive-grid-2 detail-grid" style={{ marginTop: '1.25rem' }}>
                <div>
                  <span className="text-muted">Current Stock:</span>
                  <br />
                  <strong style={{ fontSize: '1.2rem' }}>
                    {selectedItem.quantity} {selectedItem.unitOfMeasure}
                  </strong>
                </div>

                <div>
                  <span className="text-muted">Unit Valuation:</span>
                  <br />
                  <strong>{formatMoney(selectedItem.listPrice)}</strong>
                </div>

                <div>
                  <span className="text-muted">Adjustment:</span>
                  <br />
                  <strong
                    style={{
                      fontSize: '1.2rem',
                      color: movementType === 'STOCK_IN' ? '#059669' : '#dc2626',
                    }}
                  >
                    {quantity ? (movementType === 'STOCK_IN' ? `+${quantity}` : `-${quantity}`) : '0'}{' '}
                    {selectedItem.unitOfMeasure}
                  </strong>
                </div>

                <div>
                  <span className="text-muted">New Stock After Posting:</span>
                  <br />
                  <strong
                    style={{
                      fontSize: '1.4rem',
                      color: '#2563eb',
                    }}
                  >
                    {movementType === 'STOCK_IN'
                      ? selectedItem.quantity + Number(quantity || 0)
                      : selectedItem.quantity - Number(quantity || 0)}{' '}
                    {selectedItem.unitOfMeasure}
                  </strong>
                </div>
              </div>

              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '0.8rem 1rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(37, 99, 235, 0.08)',
                  border: '1px solid rgba(37, 99, 235, 0.2)',
                  fontSize: '0.88rem',
                }}
              >
                ℹ️ Once posted, this transaction will update the warehouse inventory and append a permanent audit log to the <strong>Stock Movements</strong> ledger.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
