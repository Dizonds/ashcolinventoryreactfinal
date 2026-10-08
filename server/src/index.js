import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ashcol_inventory';

app.use(cors());
app.use(express.json());

// ─── SCHEMAS ──────────────────────────────────────────────────────────────────

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, default: 'Split Type' },
    itemType: { type: String, default: 'AC Unit' },
    brand: { type: String, default: 'Carrier' },
    capacity: { type: String, default: '1.0 HP' },
    unitOfMeasure: { type: String, default: 'UNIT' },
    unitCost: { type: Number, default: 0 },
    listPrice: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 3 },
  },
  { timestamps: true }
);

const movementSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true },
    itemName: { type: String, required: true },
    movementType: { type: String, default: 'STOCK_IN' },
    quantityDelta: { type: Number, required: true },
    reason: { type: String, default: 'Warehouse Delivery' },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  },
  { timestamps: true }
);

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerAddress: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    status: { type: String, default: 'Unpaid', enum: ['Unpaid', 'Paid', 'Cancelled', 'Partial'] },
    items: [
      {
        productId: { type: String },
        sku: { type: String },
        name: { type: String },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
      },
    ],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    dueDate: { type: String, default: '' },
  },
  { timestamps: true }
);

const salesOrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerAddress: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Confirmed', 'Delivered', 'Cancelled'] },
    items: [
      {
        productId: { type: String },
        sku: { type: String },
        name: { type: String },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
      },
    ],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    orderDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    deliveryDate: { type: String, default: '' },
    invoiceId: { type: String, default: '' },
  },
  { timestamps: true }
);

const serviceTicketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerAddress: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    unitBrand: { type: String, default: '' },
    unitModel: { type: String, default: '' },
    unitCapacity: { type: String, default: '' },
    serialNumber: { type: String, default: '' },
    issueDescription: { type: String, required: true },
    serviceType: {
      type: String,
      default: 'Repair',
      enum: ['Repair', 'Preventive Maintenance', 'Installation', 'Check-up', 'Other'],
    },
    status: { type: String, default: 'Open', enum: ['Open', 'In Progress', 'Completed', 'Cancelled'] },
    assignedTechnician: { type: String, default: '' },
    scheduledDate: { type: String, default: '' },
    completedDate: { type: String, default: '' },
    laborCost: { type: Number, default: 0 },
    partsCost: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  },
  { timestamps: true }
);

const serviceHistorySchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true },
    ticketNumber: { type: String, required: true },
    customerName: { type: String, required: true },
    unitBrand: { type: String, default: '' },
    unitModel: { type: String, default: '' },
    serviceType: { type: String, default: 'Repair' },
    technicianName: { type: String, default: '' },
    workDone: { type: String, default: '' },
    partsUsed: [
      {
        sku: { type: String },
        name: { type: String },
        quantity: { type: Number, default: 1 },
      },
    ],
    laborCost: { type: Number, default: 0 },
    partsCost: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    completedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

const siteSurveySchema = new mongoose.Schema(
  {
    surveyNumber: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerAddress: { type: String, required: true },
    customerPhone: { type: String, default: '' },
    surveyDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    conductedBy: { type: String, default: '' },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Completed', 'Cancelled'] },
    roomCount: { type: Number, default: 1 },
    floorArea: { type: String, default: '' },
    recommendedUnits: [
      {
        location: { type: String },
        unitType: { type: String },
        capacity: { type: String },
        quantity: { type: Number, default: 1 },
        estimatedCost: { type: Number, default: 0 },
      },
    ],
    estimatedTotal: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    followUpDate: { type: String, default: '' },
    convertedToOrder: { type: Boolean, default: false },
    salesOrderId: { type: String, default: '' },
  },
  { timestamps: true }
);

// ─── MODELS ───────────────────────────────────────────────────────────────────

const Product       = mongoose.model('Product',       productSchema,       'products');
const Movement      = mongoose.model('Movement',      movementSchema,      'stock_movements');
const Brand         = mongoose.model('Brand',         brandSchema,         'brands');
const Invoice       = mongoose.model('Invoice',       invoiceSchema,       'invoices');
const SalesOrder    = mongoose.model('SalesOrder',    salesOrderSchema,    'sales_orders');
const ServiceTicket = mongoose.model('ServiceTicket', serviceTicketSchema, 'service_tickets');
const ServiceHistory= mongoose.model('ServiceHistory',serviceHistorySchema,'service_history');
const SiteSurvey    = mongoose.model('SiteSurvey',    siteSurveySchema,    'site_surveys');

// ─── HEALTH ───────────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

app.get('/api/products', async (req, res) => {
  try {
    const items = await Product.find().sort({ createdAt: -1 });
    res.json(items.map((doc) => ({
      id: doc._id.toString(),
      sku: doc.sku, name: doc.name, category: doc.category,
      itemType: doc.itemType, brand: doc.brand, capacity: doc.capacity,
      unitOfMeasure: doc.unitOfMeasure, unitCost: doc.unitCost,
      listPrice: doc.listPrice, quantity: doc.quantity, reorderLevel: doc.reorderLevel,
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/products', async (req, res) => {
  try {
    const { sku, name, category, itemType, brand, capacity, unitOfMeasure, unitCost, listPrice, quantity, reorderLevel } = req.body;
    const newItem = new Product({
      sku, name,
      category: category || 'Split Type',
      itemType: itemType || 'AC Unit',
      brand: brand || 'Carrier',
      capacity: capacity || '1.0 HP',
      unitOfMeasure: unitOfMeasure || 'UNIT',
      unitCost: Number(unitCost) || 0,
      listPrice: Number(listPrice) || 0,
      quantity: Number(quantity) || 0,
      reorderLevel: Number(reorderLevel) || 3,
    });
    await newItem.save();
    if (Number(quantity) > 0) {
      await Movement.create({
        sku: newItem.sku, itemName: newItem.name,
        movementType: 'STOCK_IN', quantityDelta: Number(quantity),
        reason: 'Initial Opening Stock Entry',
      });
    }
    res.status(201).json({
      id: newItem._id.toString(), sku: newItem.sku, name: newItem.name,
      category: newItem.category, itemType: newItem.itemType, brand: newItem.brand,
      capacity: newItem.capacity, unitOfMeasure: newItem.unitOfMeasure,
      unitCost: newItem.unitCost, listPrice: newItem.listPrice,
      quantity: newItem.quantity, reorderLevel: newItem.reorderLevel,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/products/:id/stock', async (req, res) => {
  try {
    const { delta, reason } = req.body;
    const item = await Product.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    const change = Number(delta);
    item.quantity = Math.max(0, item.quantity + change);
    await item.save();
    await Movement.create({
      sku: item.sku, itemName: item.name,
      movementType: change >= 0 ? 'STOCK_IN' : 'STOCK_OUT',
      quantityDelta: change,
      reason: reason || (change >= 0 ? 'Supplier Delivery / Restock' : 'Dispatched for Installation'),
    });
    res.json({ id: item._id.toString(), quantity: item.quantity });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── MOVEMENTS ────────────────────────────────────────────────────────────────

app.get('/api/movements', async (req, res) => {
  try {
    const logs = await Movement.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs.map((m) => ({
      id: m._id.toString(), sku: m.sku, itemName: m.itemName,
      movementType: m.movementType, quantityDelta: m.quantityDelta,
      reason: m.reason, date: m.date,
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── BRANDS ───────────────────────────────────────────────────────────────────

app.get('/api/brands', async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json(brands.map((b) => ({ id: b._id.toString(), name: b.name })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/brands', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Brand name is required' });
    const trimmed = name.trim();
    const existing = await Brand.findOne({ name: { $regex: new RegExp(`^${trimmed}$`, 'i') } });
    if (existing) return res.json({ id: existing._id.toString(), name: existing.name });
    const created = await Brand.create({ name: trimmed });
    res.status(201).json({ id: created._id.toString(), name: created.name });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/brands/:id', async (req, res) => {
  try {
    await Brand.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── INVOICES ─────────────────────────────────────────────────────────────────

app.get('/api/invoices', async (req, res) => {
  try {
    const docs = await Invoice.find().sort({ createdAt: -1 });
    res.json(docs.map((d) => ({ ...d.toObject(), id: d._id.toString() })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/invoices/:id', async (req, res) => {
  try {
    const doc = await Invoice.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ ...doc.toObject(), id: doc._id.toString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/invoices', async (req, res) => {
  try {
    // Auto-generate invoice number if not provided
    if (!req.body.invoiceNumber) {
      const count = await Invoice.countDocuments();
      req.body.invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`;
    }
    const doc = await Invoice.create(req.body);
    res.status(201).json({ ...doc.toObject(), id: doc._id.toString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/invoices/:id', async (req, res) => {
  try {
    const doc = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ...doc.toObject(), id: doc._id.toString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/invoices/:id', async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── SALES ORDERS ─────────────────────────────────────────────────────────────

app.get('/api/sales-orders', async (req, res) => {
  try {
    const docs = await SalesOrder.find().sort({ createdAt: -1 });
    res.json(docs.map((d) => ({ ...d.toObject(), id: d._id.toString() })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/sales-orders/:id', async (req, res) => {
  try {
    const doc = await SalesOrder.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ ...doc.toObject(), id: doc._id.toString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/sales-orders', async (req, res) => {
  try {
    if (!req.body.orderNumber) {
      const count = await SalesOrder.countDocuments();
      req.body.orderNumber = `SO-${String(count + 1).padStart(5, '0')}`;
    }
    const doc = await SalesOrder.create(req.body);
    res.status(201).json({ ...doc.toObject(), id: doc._id.toString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/sales-orders/:id', async (req, res) => {
  try {
    const doc = await SalesOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ...doc.toObject(), id: doc._id.toString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/sales-orders/:id', async (req, res) => {
  try {
    await SalesOrder.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── SERVICE TICKETS ──────────────────────────────────────────────────────────

app.get('/api/service-tickets', async (req, res) => {
  try {
    const docs = await ServiceTicket.find().sort({ createdAt: -1 });
    res.json(docs.map((d) => ({ ...d.toObject(), id: d._id.toString() })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/service-tickets/:id', async (req, res) => {
  try {
    const doc = await ServiceTicket.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ ...doc.toObject(), id: doc._id.toString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/service-tickets', async (req, res) => {
  try {
    if (!req.body.ticketNumber) {
      const count = await ServiceTicket.countDocuments();
      req.body.ticketNumber = `ST-${String(count + 1).padStart(5, '0')}`;
    }
    const doc = await ServiceTicket.create(req.body);
    res.status(201).json({ ...doc.toObject(), id: doc._id.toString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/service-tickets/:id', async (req, res) => {
  try {
    const doc = await ServiceTicket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ...doc.toObject(), id: doc._id.toString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/service-tickets/:id', async (req, res) => {
  try {
    await ServiceTicket.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── SERVICE HISTORY ──────────────────────────────────────────────────────────

app.get('/api/service-history', async (req, res) => {
  try {
    const docs = await ServiceHistory.find().sort({ createdAt: -1 });
    res.json(docs.map((d) => ({ ...d.toObject(), id: d._id.toString() })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/service-history/:id', async (req, res) => {
  try {
    const doc = await ServiceHistory.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ ...doc.toObject(), id: doc._id.toString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/service-history', async (req, res) => {
  try {
    const doc = await ServiceHistory.create(req.body);
    res.status(201).json({ ...doc.toObject(), id: doc._id.toString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/service-history/:id', async (req, res) => {
  try {
    const doc = await ServiceHistory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ...doc.toObject(), id: doc._id.toString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/service-history/:id', async (req, res) => {
  try {
    await ServiceHistory.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── SITE SURVEYS ─────────────────────────────────────────────────────────────

app.get('/api/site-surveys', async (req, res) => {
  try {
    const docs = await SiteSurvey.find().sort({ createdAt: -1 });
    res.json(docs.map((d) => ({ ...d.toObject(), id: d._id.toString() })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/site-surveys/:id', async (req, res) => {
  try {
    const doc = await SiteSurvey.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ ...doc.toObject(), id: doc._id.toString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/site-surveys', async (req, res) => {
  try {
    if (!req.body.surveyNumber) {
      const count = await SiteSurvey.countDocuments();
      req.body.surveyNumber = `SS-${String(count + 1).padStart(5, '0')}`;
    }
    const doc = await SiteSurvey.create(req.body);
    res.status(201).json({ ...doc.toObject(), id: doc._id.toString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/site-surveys/:id', async (req, res) => {
  try {
    const doc = await SiteSurvey.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ...doc.toObject(), id: doc._id.toString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/site-surveys/:id', async (req, res) => {
  try {
    await SiteSurvey.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── DB CONNECT & START ───────────────────────────────────────────────────────

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected:', MONGO_URI);
    try {
      const count = await Brand.countDocuments();
      if (count === 0) {
        const defaultBrands = [
          'Carrier', 'Daikin', 'Panasonic', 'LG', 'Kolin',
          'Samsung', 'Mitsubishi', 'Midea', 'Gree', 'TCL',
          'Hitachi', 'Toshiba', 'Generic Parts',
        ];
        await Brand.insertMany(defaultBrands.map((name) => ({ name })));
        console.log('Default brands seeded.');
      }
    } catch (e) {
      console.log('Seed error:', e.message);
    }
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('DB Connection Error:', err.message);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (no DB)`);
    });
  });
