import React, { useState } from 'react';
import { formatMoney } from '../utils/formatters';

export default function InventorySection({
  items,
  brands = [],
  onAddItem,
  onDeleteItem,
  onAddBrand,
  searchTerm,
  onNavigateToPostMovement,
}) {
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const [itemType, setItemType] = useState('AC Unit');
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Split Type');
  const [capacity, setCapacity] = useState('1.0 HP');
  const [unitOfMeasure, setUnitOfMeasure] = useState('UNIT');
  const [unitCost, setUnitCost] = useState('18000');
  const [listPrice, setListPrice] = useState('24000');
  const [reorderLevel, setReorderLevel] = useState('3');
  const [initialStock, setInitialStock] = useState('10');

  const [brandInput, setBrandInput] = useState('Carrier');
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);

  const handleItemTypeChange = (newType) => {
    setItemType(newType);
    if (newType === 'AC Unit') {
      setCategory('Split Type');
      setUnitOfMeasure('UNIT');
      setCapacity('1.0 HP');
      setBrandInput('Carrier');
      setUnitCost('18000');
      setListPrice('24000');
    } else {
      setCategory('Compressors');
      setUnitOfMeasure('PCS');
      setCapacity('11.3 kg');
      setBrandInput('Generic Parts');
      setUnitCost('3500');
      setListPrice('5000');
    }
  };

  const matchingBrands = brands.filter(({ name: bName }) =>
    bName.toLowerCase().includes(brandInput.toLowerCase().trim())
  );

  const exactBrandMatches = brands.filter(
    ({ name: bName }) => bName.toLowerCase() === brandInput.toLowerCase().trim()
  );
  const exactBrandMatch = exactBrandMatches.length > 0;

  const handleSelectBrandOption = (selectedName) => {
    setBrandInput(selectedName);
    setIsBrandDropdownOpen(false);
  };

  const filteredItems = items
    .filter((item) => {
      const { itemType: it } = item;
      return selectedType === 'ALL' || it === selectedType;
    })
    .filter((item) => {
      const { category: pCat } = item;
      return selectedCategory === '' || pCat === selectedCategory;
    })
    .filter((item) => {
      const { brand: pBrand } = item;
      return selectedBrandFilter === '' || (pBrand && pBrand.toLowerCase() === selectedBrandFilter.toLowerCase());
    })
    .filter((item) => {
      const { name: pName, sku: pSku, brand: pBrand } = item;
      const term = searchTerm.toLowerCase();
      return (
        pName.toLowerCase().includes(term) ||
        pSku.toLowerCase().includes(term) ||
        (pBrand && pBrand.toLowerCase().includes(term))
      );
    });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!sku || !name) {
      alert('Please provide SKU/Model and Item Name!');
      return;
    }

    const cleanBrand = brandInput.trim();
    if (!cleanBrand) {
      alert('Please specify a brand name!');
      return;
    }

    if (!exactBrandMatch) {
      onAddBrand(cleanBrand);
    }

    const newItem = {
      sku,
      name,
      category,
      itemType,
      brand: cleanBrand,
      capacity,
      unitOfMeasure,
      unitCost: Number(unitCost),
      listPrice: Number(listPrice),
      quantity: Number(initialStock),
      reorderLevel: Number(reorderLevel),
    };

    onAddItem(newItem);

    setSku('');
    setName('');
    setIsBrandDropdownOpen(false);
  };

  return (
    <div className="main">
      <div className="dashboard-copy">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>AC Equipment & Spare Parts Inventory</h1>
            <p>Unified catalog for air conditioning units, compressors, freon refrigerants, and installation materials.</p>
          </div>
          {onNavigateToPostMovement && (
            <button
              className="btn btn-primary"
              onClick={onNavigateToPostMovement}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
            >
              <span>⇄</span> Post Stock Movement
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="section-head">
          <h2>Inventory Catalog ({filteredItems.length} items)</h2>
        </div>

        <div className="toolbar">
          <div className="field">
            <label>Item Type</label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setSelectedCategory('');
              }}
            >
              <option value="ALL">All Types (AC Units & Parts)</option>
              <option value="AC Unit">AC Units</option>
              <option value="Material / Part">Spare Parts & Refrigerants</option>
            </select>
          </div>

          <div className="field">
            <label>Brand Filter</label>
            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
            >
              <option value="">All Brands</option>
              {brands.map((b) => {
                const { id, name: bName } = b;
                return (
                  <option key={id} value={bName}>
                    {bName}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="field">
            <label>Category Filter</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {selectedType !== 'Material / Part' && (
                <optgroup label="AC Units">
                  <option value="Split Type">Split Type</option>
                  <option value="Window Type">Window Type</option>
                  <option value="Floor Mounted">Floor Mounted</option>
                  <option value="Portable">Portable AC</option>
                </optgroup>
              )}
              {selectedType !== 'AC Unit' && (
                <optgroup label="Parts & Supplies">
                  <option value="Compressors">Compressors</option>
                  <option value="Refrigerants">Refrigerants (Freon)</option>
                  <option value="Installation Materials">Installation Materials</option>
                  <option value="Copper Tubing">Copper Tubing</option>
                </optgroup>
              )}
            </select>
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setSelectedType('ALL');
              setSelectedCategory('');
              setSelectedBrandFilter('');
            }}
          >
            Reset Filters
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>SKU / MODEL</th>
                <th>Item Description</th>
                <th>Type</th>
                <th>Brand</th>
                <th>Capacity / Specs</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Warehouse Qty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-muted" style={{ textAlign: 'center', padding: '2.5rem' }}>
                    No items found matching the selected filters. Use the registration form below to add inventory items!
                  </td>
                </tr>
              ) : (
                filteredItems.map((p) => {
                  const {
                    id,
                    sku: pSku,
                    name: pName,
                    itemType: pType,
                    category: pCat,
                    brand: pBrand,
                    capacity: pCap,
                    listPrice: pPrice,
                    quantity: pQty,
                  } = p;

                  return (
                    <tr key={id}>
                      <td className="mono">{pSku}</td>
                      <td><strong>{pName}</strong></td>
                      <td>
                        <span className={`badge ${pType === 'AC Unit' ? 'badge-blue' : 'badge-amber'}`}>
                          {pType}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-gray">{pBrand || 'Generic'}</span>
                      </td>
                      <td>{pCap}</td>
                      <td>{pCat}</td>
                      <td>{formatMoney(pPrice)}</td>
                      <td style={{ fontWeight: 'bold', color: pQty <= 3 ? '#dc2626' : 'inherit' }}>
                        {pQty}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm"
                          style={{ marginRight: '6px' }}
                          onClick={() => setSelectedItem(p)}
                        >
                          Details
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => onDeleteItem(id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-head">
            <h2>Register New Item</h2>
          </div>

          <form className="form-grid" onSubmit={handleCreate}>
            <div className="field">
              <label>Inventory Classification</label>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  className={`btn ${itemType === 'AC Unit' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ flex: 1, padding: '0.6rem' }}
                  onClick={() => handleItemTypeChange('AC Unit')}
                >
                  AC Unit (Complete System)
                </button>
                <button
                  type="button"
                  className={`btn ${itemType === 'Material / Part' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ flex: 1, padding: '0.6rem' }}
                  onClick={() => handleItemTypeChange('Material / Part')}
                >
                  Spare Part / Refrigerant
                </button>
              </div>
            </div>

            <label>
              SKU / Model Code
              <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. CAR-1.5HP-INV"
                required
              />
            </label>

            <label>
              Item Description / Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Carrier Optima Inverter 1.5 HP Split"
                required
              />
            </label>

            <label>
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {itemType === 'AC Unit' ? (
                  <>
                    <option value="Split Type">Split Type</option>
                    <option value="Window Type">Window Type</option>
                    <option value="Floor Mounted">Floor Mounted</option>
                    <option value="Portable">Portable AC</option>
                  </>
                ) : (
                  <>
                    <option value="Compressors">Compressors</option>
                    <option value="Refrigerants">Refrigerants (Freon)</option>
                    <option value="Installation Materials">Installation Materials</option>
                    <option value="Copper Tubing">Copper Tubing</option>
                  </>
                )}
              </select>
            </label>

            <div className="field" style={{ position: 'relative' }}>
              <label>
                Brand
                <span className="text-muted" style={{ fontSize: '0.78rem', marginLeft: '0.4rem' }}>
                  (Type to search or add any brand name)
                </span>
              </label>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  value={brandInput}
                  onChange={(e) => {
                    setBrandInput(e.target.value);
                    setIsBrandDropdownOpen(true);
                  }}
                  onFocus={() => setIsBrandDropdownOpen(true)}
                  placeholder="Type or select a brand (e.g. Carrier, Daikin, Midea)..."
                  required
                  style={{ width: '100%', paddingRight: '2rem' }}
                />
                <button
                  type="button"
                  onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted, #64748b)',
                    padding: '4px',
                  }}
                  title="Toggle Brand List"
                >
                  {isBrandDropdownOpen ? '▲' : '▼'}
                </button>
              </div>

              {isBrandDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    backgroundColor: 'var(--bg-card, #ffffff)',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    borderRadius: '6px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    marginTop: '4px',
                  }}
                >
                  {matchingBrands.map((b) => {
                    const { id, name: bName } = b;
                    const isSelected = bName.toLowerCase() === brandInput.toLowerCase().trim();
                    return (
                      <div
                        key={id}
                        onClick={() => handleSelectBrandOption(bName)}
                        style={{
                          padding: '0.6rem 0.9rem',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                          fontWeight: isSelected ? 'bold' : 'normal',
                          color: isSelected ? '#2563eb' : 'inherit',
                          borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.06)')}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = isSelected ? 'rgba(37, 99, 235, 0.08)' : 'transparent')
                        }
                      >
                        <span>{bName}</span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Partner Brand</span>
                      </div>
                    );
                  })}

                  {brandInput.trim() !== '' && !exactBrandMatch && (
                    <div
                      onClick={() => {
                        const clean = brandInput.trim();
                        onAddBrand(clean);
                        setIsBrandDropdownOpen(false);
                      }}
                      style={{
                        padding: '0.65rem 0.9rem',
                        cursor: 'pointer',
                        backgroundColor: 'rgba(5, 150, 105, 0.08)',
                        color: '#059669',
                        fontWeight: 'bold',
                        borderTop: '1px solid rgba(5, 150, 105, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span>➕</span>
                      <span>Add <strong>"{brandInput.trim()}"</strong> as a new brand</span>
                    </div>
                  )}

                  {matchingBrands.length === 0 && exactBrandMatch && (
                    <div style={{ padding: '0.8rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                      No matching brands found.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="responsive-grid-2">
              <label>
                Capacity / Rating
                <input
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="e.g. 1.0 HP, 11.3 kg, 15m"
                />
              </label>
              <label>
                Unit of Measure
                <input
                  value={unitOfMeasure}
                  onChange={(e) => setUnitOfMeasure(e.target.value)}
                  placeholder="UNIT, ROLL, CAN, PCS"
                />
              </label>
              <label>
                Cost Price (₱)
                <input
                  type="number"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                />
              </label>
              <label>
                Retail Price (₱)
                <input
                  type="number"
                  value={listPrice}
                  onChange={(e) => setListPrice(e.target.value)}
                />
              </label>
              <label>
                Initial Stock Qty
                <input
                  type="number"
                  value={initialStock}
                  onChange={(e) => setInitialStock(e.target.value)}
                />
              </label>
              <label>
                Reorder Alert Level
                <input
                  type="number"
                  value={reorderLevel}
                  onChange={(e) => setReorderLevel(e.target.value)}
                />
              </label>
            </div>

            <button className="btn" type="submit">
              Save Item to Inventory
            </button>
          </form>
        </div>

        <div className="card">
          <h2 style={{ margin: '0 0 1rem' }}>Item Specifications</h2>
          {!selectedItem ? (
            <p className="text-muted">Click "Details" on any item in the table to inspect records.</p>
          ) : (
            <div className="detail-panel">
              <h3>{selectedItem.name}</h3>
              <p>
                {selectedItem.sku} · Type: {selectedItem.itemType} · Brand: <strong>{selectedItem.brand}</strong> · Specs: {selectedItem.capacity}
              </p>
              <div className="responsive-grid-2 detail-grid" style={{ marginTop: '1rem' }}>
                <div>
                  <span className="text-muted">Cost Price:</span>
                  <br />
                  <strong>{formatMoney(selectedItem.unitCost)}</strong>
                </div>
                <div>
                  <span className="text-muted">Selling Price:</span>
                  <br />
                  <strong>{formatMoney(selectedItem.listPrice)}</strong>
                </div>
                <div>
                  <span className="text-muted">Current Stock:</span>
                  <br />
                  <strong style={{ fontSize: '1.2rem', color: '#059669' }}>
                    {selectedItem.quantity} {selectedItem.unitOfMeasure}
                  </strong>
                </div>
                <div>
                  <span className="text-muted">Reorder Threshold:</span>
                  <br />
                  <strong>{selectedItem.reorderLevel} units</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
