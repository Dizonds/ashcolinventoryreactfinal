import { Router } from "express";
import { Branch, Brand, User, Supplier } from "../models.js";
import { admin, manage, hashPassword } from "../auth.js";
import { text, fail, json } from "../helpers.js";

const router = Router();
router.get("/branches", (req, res, next) => {
  const filter = req.user.role === "ADMIN" ? {} : { _id: req.user.branchId };
  Branch.find(filter)
    .sort({ name: 1 })
    .then((items) => res.json(items.map(json)))
    .catch(next);
});
router.post("/branches", admin, (req, res, next) => {
  const id = text(req.body.id, "Branch ID");
  if (!/^[A-Za-z0-9-]+$/.test(id))
    fail("Use letters, numbers and hyphens for branch IDs.");
  const branchType = ["SERVICE_VAN", "WAREHOUSE"].includes(req.body.branchType)
    ? req.body.branchType
    : "WAREHOUSE";
  const plateNumber = text(req.body.plateNumber || "", "Plate number", false);
  const status = ["AVAILABLE", "ON_FIELD", "MAINTENANCE"].includes(req.body.status)
    ? req.body.status
    : "AVAILABLE";
  Branch.create({
    _id: id,
    name: text(req.body.name, "Branch name"),
    branchType,
    plateNumber,
    status,
  })
    .then((item) => res.status(201).json(json(item)))
    .catch(next);
});
router.patch("/branches/:id/status", manage, (req, res, next) => {
  const status = text(req.body.status, "Status");
  if (!["AVAILABLE", "ON_FIELD", "MAINTENANCE"].includes(status))
    fail("Invalid status.");
  Branch.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true })
    .then((item) => {
      if (!item) fail("Branch or van not found.", 404);
      res.json(json(item));
    })
    .catch(next);
});
router.get("/brands", (req, res, next) => {
  Brand.find()
    .sort({ name: 1 })
    .then((items) => res.json(items.map(json)))
    .catch(next);
});
router.post("/brands", manage, (req, res, next) => {
  const name = text(req.body.name, "Brand");
  Brand.findOne({ name })
    .collation({ locale: "en", strength: 2 })
    .then((found) => found || Brand.create({ name }))
    .then((item) => res.status(201).json(json(item)))
    .catch(next);
});
router.get("/suppliers", (req, res, next) => {
  Supplier.find()
    .sort({ name: 1 })
    .then((items) => res.json(items.map(json)))
    .catch(next);
});
router.post("/suppliers", manage, (req, res, next) => {
  const name = text(req.body.name, "Supplier name");
  Supplier.findOneAndUpdate(
    { name },
    {
      $set: {
        name,
        contactPerson: text(req.body.contactPerson || "", "Contact person", false),
        phone: text(req.body.phone || "", "Phone", false),
        email: text(req.body.email || "", "Email", false),
        address: text(req.body.address || "", "Address", false),
        terms: text(req.body.terms || "", "Terms", false),
      },
    },
    { upsert: true, new: true },
  )
    .then((item) => res.status(201).json(json(item)))
    .catch(next);
});
router.get("/users", admin, (req, res, next) => {
  User.find()
    .sort({ fullName: 1 })
    .then((items) => res.json(items.map(json)))
    .catch(next);
});
router.post("/users", admin, (req, res, next) => {
  const email = text(req.body.email, "Email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("Enter a valid email.");
  const fullName = text(req.body.fullName, "Full name");
  text(req.body.password, "Password");
  const password = req.body.password;
  if (password.length < 10) fail("Use at least 10 characters for passwords.");
  const role = text(req.body.role, "Role");
  const branchId = text(req.body.branchId, "Branch");
  Branch.findById(branchId)
    .then((branch) => {
      if (!branch) fail("Branch not found.", 404);
      return hashPassword(password);
    })
    .then((passwordHash) =>
      User.create({ email, fullName, role, branchId, passwordHash }),
    )
    .then((user) => res.status(201).json(json(user)))
    .catch(next);
});
export default router;
