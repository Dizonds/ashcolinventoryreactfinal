# ASHCOL INVENTORY MANAGEMENT SYSTEM

## Project Overview & Scope ng System

## 1. Project Overview

The **ASHCOL Inventory Management System** is a web-based inventory and stock-control application designed to help ASHCOL organize, monitor, and manage products, materials, spare parts, tools, equipment, and service-related inventory across branches and service vans.

The system replaces fragmented or manual inventory recording with a centralized application that provides a current view of stock quantities, product details, stock movements, material requests, branch transfers, suppliers, and user activity. It is intended to support the day-to-day operations of warehouse personnel, branch managers, employees, administrators, technicians, and service teams.

The system focuses on accurate stock visibility and traceability. Every stock addition or deduction is recorded as a movement with the affected item, quantity before and after the transaction, reason, reference number, work-order number when applicable, date, and user who performed the action. This allows authorized users to understand not only how much stock is available, but also why the quantity changed.

The application is built as a separate inventory system. It does not directly modify the existing ASHCOL production portal, does not reuse production-portal passwords, and does not assume or guess existing branch and job-number mappings. Any future integration with another ASHCOL system would require a separately verified integration design.

## 2. Purpose of the System

The main purpose of the system is to provide a reliable and organized way to:

- Maintain a centralized product and material catalog.
- Monitor available, reserved, and total stock quantities.
- Record inventory receiving, issuing, returns, write-offs, and corrections.
- Support material requests tied to a job or work order.
- Control transfers between branches and service vans.
- Provide role-based access to sensitive inventory operations.
- Preserve a historical audit trail for stock and catalog changes.
- Help management identify low-stock items and review inventory value.
- Reduce stock discrepancies caused by incomplete, duplicated, or undocumented transactions.

## 3. General Problem Being Addressed

Inventory operations can become difficult to manage when records are maintained through paper forms, spreadsheets, chat messages, or separate files. These methods may result in:

- Unclear or outdated stock balances.
- Duplicate product records and inconsistent SKU names.
- Missing receiving or issuing references.
- Stock deductions that cannot be traced to a person or job.
- Difficulty identifying materials reserved for approved requests.
- Delayed detection of reorder requirements.
- Limited visibility across branches and service vehicles.
- Accidental changes to historical quantities.
- Inability to distinguish current stock value from potential selling value.

The ASHCOL Inventory Management System addresses these problems through controlled workflows, branch ownership, validation, transactional stock updates, and movement history.

## 4. System Objectives

### 4.1 Primary objectives

1. **Improve inventory accuracy** by ensuring that stock changes are recorded through defined movement workflows.
2. **Improve visibility** by presenting current inventory, reserved quantities, available quantities, low-stock alerts, and movement history.
3. **Improve accountability** by recording the responsible user and transaction details for important actions.
4. **Improve request processing** by linking material requests to products and work-order references.
5. **Improve branch control** by restricting users to the branches and service scopes assigned to them.
6. **Improve data integrity** by validating quantities, units of measure, SKU uniqueness, and stock availability.
7. **Support operational decision-making** through dashboard summaries, stock valuation estimates, and searchable records.

### 4.2 Secondary objectives

- Provide a simple interface that can be used by non-technical inventory personnel.
- Keep archived records available for historical review.
- Support fractional quantities for materials such as meters, kilograms, liters, and feet.
- Prevent unauthorized direct editing of stock quantities.
- Provide a foundation for later reporting, barcode scanning, purchasing, and integrations.

## 5. Intended Users

The system supports three main user roles:

| Role | General responsibility | Main access |
| --- | --- | --- |
| **ADMIN** | Overall system and organization administrator | All configured branches, accounts, catalog records, inventory operations, transfers, and request decisions |
| **MANAGER** | Branch or inventory manager | Assigned-branch inventory, catalog maintenance, stock movements, requests, suppliers, and permitted service-van operations |
| **EMPLOYEE** | Staff member, technician, or requester | Assigned-branch catalog and ledger viewing, plus submission of material requests |

Access is enforced by the backend and is not limited to hiding buttons in the interface. A user’s role and branch assignment are checked whenever a protected operation is requested.

### Sidebar Access by Role

The sidebar is role-based. Pages may be visible to multiple roles, but the actions available inside each page depend on the user’s permissions.

#### Employee

- **Overview** — View dashboard summaries for the assigned branch.
- **Inventory Catalog** — View products and stock information; cannot edit product details or change quantities.
- **Service Vehicles** — View vehicle records and status; cannot add new vehicles, assign drivers, or manage vehicle stock.
- **Model Matching** — Search compatible products and models.
- **Suppliers & Vendors** — View supplier and brand information; cannot add or edit supplier records.
- **Material Requests** — Submit material requests for jobs or work orders; cannot approve, deny, or fulfill requests.
- **Stock Ledger** — View stock movement history for the assigned branch.

Employees cannot access **Post Movement**, **Branches**, or **User Management**. They cannot directly add, deduct, correct, transfer, or archive inventory.

#### Manager

- **Overview** — Review branch summaries, reorder indicators, and inventory values.
- **Inventory Catalog** — View and edit product specifications for the assigned branch; stock quantities must be changed through movements.
- **Service Vehicles** — Manage permitted vehicle operations, including status, driver assignment, and allowed stock-loading workflows; cannot create system-wide user accounts.
- **Model Matching** — Search compatible products and models.
- **Suppliers & Vendors** — View and maintain supplier and brand information.
- **Material Requests** — Review, approve, deny, and fulfill requests for the assigned branch.
- **Post Movement** — Record deliveries, returns, issues, sales, write-offs, and audit corrections for the assigned branch.
- **Stock Ledger** — Review movement history and audit details for the assigned branch.

Managers cannot create user accounts or manage all branches. Their actions are limited to their assigned branch and permitted service-vehicle scope.

#### Administrator

- **Overview** — View system-wide or configured-scope dashboard information.
- **Inventory Catalog** — Manage product records and inventory operations across authorized branches.
- **Service Vehicles** — Add, configure, assign, and manage service vehicles and their stock operations.
- **Model Matching** — Search compatible products and models.
- **Suppliers & Vendors** — Create and maintain supplier and brand records.
- **Material Requests** — Review, approve, deny, and fulfill requests across configured branches.
- **Post Movement** — Record and audit stock movements, corrections, and transfers.
- **Stock Ledger** — Review movement history across authorized branches.
- **Branches** — Create and manage warehouse or branch records.
- **User Management** — Create employee, manager, and administrator accounts and assign branch access.

Administrators have the highest level of access, but stock quantities should still be changed through documented movements so the audit trail remains complete.

## 6. Core System Modules

### 6.1 Login and account management

The system includes authenticated user accounts using email addresses and passwords. Passwords are stored as protected password hashes rather than plain text. Sessions use expiring server-side tokens, and users can log out of the application.

Administrators can create users, assign their roles, and associate them with a verified branch. The first administrator is created through the backend bootstrap process during initial setup. There are no permanent built-in demo credentials for a normal installation.

### 6.2 Dashboard

The dashboard provides a high-level operational view of the inventory. It can be used to review:

- Number of active products or catalog items.
- Items that are at or below their reorder level.
- Total quantity grouped by unit of measure.
- Estimated inventory cost based on stored unit cost and quantity.
- Potential sales value based on stored list price and quantity.
- Recent stock activity and operational summaries.
- Branch-scoped inventory information for the current user.

Inventory quantities are grouped by unit. For example, meters are not added together with pieces or AC units. The cost estimate is an operational estimate and is not intended to replace FIFO, weighted-average, or formal accounting valuation.

### 6.3 Product and inventory catalog

The catalog stores the details needed to identify and manage each item. Product records may include:

- SKU or stock-keeping unit.
- Product or material name.
- Item type.
- Category.
- Brand.
- Capacity or specification.
- Unit of measure.
- Unit cost.
- List price.
- Current quantity.
- Reorder level.
- Supplier.
- Compatible models.
- Price history.
- Branch ownership.
- Archived or active status.

Supported item types include:

- AC Unit
- Material / Part
- Spare Part
- Consumable
- Tool / Equipment

Supported units include unit, piece, meter, foot, kilogram, liter, roll, cylinder, pair, can, and set. Quantity validation prevents invalid values for countable items and supports fractional quantities where appropriate.

SKUs are normalized to uppercase and must be unique within a branch. The SKU and unit of measure remain fixed after registration so that historical movements retain a consistent meaning. If an item needs a different SKU or measurement unit, it should be registered as a separate item.

### 6.4 Stock movement management

Stock quantities are changed through the **Post Movement** workflow. Users with the required permissions cannot simply overwrite the current quantity in the product details form.

Stock-in transactions may include:

- Supplier delivery or restock.
- Unused material return.
- Defective or RMA replacement return.
- Audit correction for surplus stock.

Stock-out transactions may include:

- Client installation or site project.
- Parts sale.
- Damaged or defective write-off.
- Audit correction for shortage.

Each movement records the quantity change, quantity before the transaction, quantity after the transaction, reason, reference ticket, optional job or work-order number, item information, branch, date, and user information.

The system rejects stock deductions that exceed available stock. Stock updates and their movement records are processed transactionally so that a failed operation does not leave the product balance and ledger out of sync. This also protects the inventory from common concurrent-update problems.

### 6.5 Material requests

Employees can submit requests for materials or parts needed for a job, service activity, or work order. A request includes:

- Requested product.
- Quantity needed.
- Job or work-order number.
- Requesting user.
- Optional notes.
- Branch.
- Request status.

The request lifecycle is:

1. **PENDING** – submitted and waiting for review.
2. **APPROVED** – accepted by an authorized manager or administrator.
3. **DENIED** – rejected with a decision reason when applicable.
4. **FULFILLED** – materials have actually been issued and stock has been deducted.

Approval does not automatically deduct stock. Stock is deducted only when the request is fulfilled. Approved requests contribute to reserved quantities, allowing users to distinguish total stock from the quantity that is already committed to approved requests.

The fulfillment operation records a linked stock movement and prevents the same request from being fulfilled more than once.

### 6.6 Branch and service-van management

The application supports multiple inventory scopes, including warehouse branches and service vans. A branch record may contain:

- Branch ID.
- Branch name.
- Branch type.
- Plate number for service vans.
- Assigned driver or technician.
- Current operational status.

Service-van statuses include:

- Available.
- On field.
- Arrived.
- Maintenance.

Managers and administrators can assign drivers or technicians where permitted. A service van requires an assigned driver or technician before it can be dispatched or marked as having arrived on field.

Transfers can be used to record movement between branches or between a warehouse and a service van. Administrative branch transfers create paired ledger entries with a shared reference so both sides of the transfer remain traceable.

### 6.7 Supplier and brand directory

The system includes reusable supplier and brand records to improve consistency in the catalog. Supplier records can include:

- Supplier name.
- Contact person.
- Phone number.
- Email address.
- Address.
- Terms or purchasing notes.

Brands and suppliers can be selected or maintained by authorized users instead of repeatedly typing inconsistent names into product records.

### 6.8 Movement ledger and history

The movement ledger provides a historical record of inventory activity. It supports branch-scoped viewing, server-side search, and pagination for larger data sets.

Ledger records may show:

- Movement type.
- SKU and item name.
- Unit of measure.
- Quantity delta.
- Before quantity.
- After quantity.
- Reason or explanation.
- Work-order number.
- Reference number.
- Performed-by user.
- Date and time.

Catalog detail changes, archive actions, restore actions, opening balances, stock movements, request issues, and transfers can remain visible as part of the audit history.

### 6.9 Archive and restore

The system uses archive and restore instead of permanently deleting product records. An item can be archived only when it has zero stock and no pending or approved material requests. This protects historical movement records and prevents active inventory from disappearing accidentally.

Archived items can be restored by authorized users. Their historical movements remain available for review.

## 7. Normal Operational Workflow

### 7.1 Initial setup

1. Configure MongoDB Atlas or a MongoDB replica set.
2. Configure the backend environment variables.
3. Bootstrap the first administrator account.
4. Create verified branches or service vans.
5. Create managers and employees and assign their branch scopes.
6. Add brands and supplier records as needed.

### 7.2 Registering an item

1. An authorized manager or administrator opens the product registration form.
2. The user enters the SKU, item description, classification, unit, prices, supplier, and opening quantity.
3. The system validates the data and checks that the SKU is unique within the branch.
4. The item is created with an opening balance.
5. An opening movement is recorded automatically for traceability.

### 7.3 Receiving stock

1. The user selects the product.
2. The user chooses a stock-in reason such as supplier delivery or unused-material return.
3. The user enters the quantity and supporting receipt or explanation.
4. The system increases stock and records the before-and-after balances.

### 7.4 Issuing or consuming stock

1. The user selects the item and chooses the appropriate stock-out reason.
2. The user provides a job, work-order, sales, or explanation reference when applicable.
3. The system verifies that sufficient available stock exists.
4. The system deducts the quantity and creates a ledger entry.

### 7.5 Requesting and issuing materials

1. An employee submits a material request with a job or work-order number.
2. A manager reviews and approves or denies the request.
3. Approved quantities appear as reserved quantities.
4. When the material is physically issued, an authorized user fulfills the request.
5. The system deducts the stock once and records the request-linked movement.

### 7.6 Archiving an item

1. The item must have zero current stock.
2. The item must not have pending or approved requests.
3. An authorized user archives the item.
4. The item is removed from the active catalog but remains available in historical records.

## 8. Scope of the System

### 8.1 Included in the current scope

The current system scope includes:

- Web-based inventory management.
- User login, logout, and role-based authorization.
- Administrator, manager, and employee roles.
- Branch-scoped access control.
- Product registration and catalog maintenance.
- Opening inventory balances.
- Stock-in and stock-out movements.
- Stock quantity validation and insufficient-stock protection.
- Reorder-level monitoring.
- Material requests and approval workflow.
- Reserved and available quantity calculations.
- Completed transfers between inventory scopes.
- Warehouse and service-van records.
- Supplier and brand directories.
- Price history for cost updates.
- Searchable movement history and audit information.
- Archive and restore workflow.
- Dashboard summaries and inventory estimates.
- MongoDB persistence through an Express backend.
- Automated backend, frontend, build, and browser checks.

### 8.2 Explicitly outside the current scope

The following are not currently implemented as complete production features:

- Direct integration with the existing ASHCOL production portal.
- Automatic verification of portal job numbers.
- Automatic branch mapping from another system.
- Full accounting, bookkeeping, tax, or general-ledger functionality.
- Purchase-order approval and end-to-end procurement management.
- Supplier invoice matching and payment processing.
- Payroll or employee attendance management.
- Customer relationship management.
- Full sales invoicing and payment collection.
- Real-time GPS tracking of service vans.
- In-transit transfer tracking with separate dispatch and receipt approval stages.
- Barcode or QR-code scanning hardware integration.
- Automated demand forecasting or advanced stock optimization.
- Multi-currency accounting.
- Offline-first mobile synchronization.
- Formal FIFO or weighted-average inventory valuation.

These items may be considered future enhancements, but they should not be assumed to be available in the current release.

## 9. Technical Architecture

The application uses a two-part architecture:

### Frontend

- React application created with Create React App.
- Ant Design components for forms, tables, navigation, and interface controls.
- Axios for communication with the backend API.
- Responsive pages for login, dashboard, inventory, movements, requests, service vans, suppliers, compatibility lookup, and settings.

### Backend

- Node.js runtime.
- Express web server.
- Mongoose for MongoDB data access.
- Server-side authentication and authorization.
- Transactional database operations for important stock changes.
- Validation for product, movement, request, account, and branch data.

### Main data records

The database stores products, stock movements, users, sessions, material requests, branches, brands, and suppliers. Product and movement records are associated with branch scopes to support controlled multi-branch operations.

## 10. Data Integrity and Security Controls

The system includes controls intended to keep inventory records dependable:

- Passwords are hashed before storage.
- Sessions expire and can be invalidated through logout.
- Backend routes enforce user roles and branch scope.
- SKU values are normalized and unique per branch.
- Quantities cannot be negative.
- Whole-number restrictions apply to countable items.
- Unit of measure cannot be changed after registration.
- Stock quantities cannot be edited through ordinary product detail updates.
- Insufficient stock deductions are rejected.
- Stock changes and movement records use database transactions.
- Archived items cannot be used for new requests.
- Open requests must be resolved before an item can be archived.
- Important actions include the responsible user and a reason or reference.
- Production-portal credentials and services are not modified by this project.

## 11. Operational Limitations and Important Notes

The system is an inventory operations tool, not a complete accounting system. Dashboard cost and sales figures are estimates based on the current stored item values. They should not be treated as formal financial statements.

Opening balances and migrated legacy data should be checked against physical stock. If an existing database contains historical discrepancies, the correct approach is to perform a physical count and record an explained audit correction rather than silently changing the stored quantity.

The backend requires MongoDB Atlas or a MongoDB replica set because important operations use multi-document transactions. A standalone MongoDB process is not suitable for the transaction-based workflow.

The local placeholder branch ID `LOCAL-WAREHOUSE` is intended for development or migration setup only. Production branch IDs should be verified before operational use.

## 12. Expected Benefits

When used consistently, the system can help ASHCOL:

- Reduce manual inventory errors.
- Identify stock shortages earlier.
- Improve accountability for issued and received materials.
- Reduce duplicate or inconsistent product records.
- Track materials by job or work order.
- Improve coordination between warehouses, branches, and service vans.
- Make request approvals and fulfillment easier to follow.
- Preserve historical records for review and investigation.
- Give managers a clearer basis for replenishment and operational decisions.

## 13. Future Development Opportunities

Possible future enhancements include:

- Barcode and QR-code scanning.
- Purchase orders and receiving reconciliation.
- Supplier quotation comparison.
- Automated low-stock notifications.
- Email or in-app notifications for request decisions.
- Advanced reports by branch, category, supplier, job, and date range.
- Export to Excel or PDF.
- More detailed transfer states such as prepared, dispatched, in transit, received, and cancelled.
- Mobile-friendly technician workflows.
- Offline data capture for areas with unreliable connectivity.
- Verified integration with an ASHCOL job, branch, or accounting system.
- Approval limits and configurable workflows.
- Forecasting based on historical consumption.
- Serial-number or asset-level tracking for selected equipment.
- Formal inventory valuation methods for accounting use.

## 14. Project Summary

The ASHCOL Inventory Management System provides a controlled and auditable foundation for managing inventory across branches and service operations. Its central design principle is that inventory quantities should change through documented, authorized, and traceable actions.

By combining a structured catalog, branch-aware permissions, material requests, movement history, transfer support, and transactional stock updates, the system helps ASHCOL maintain more accurate inventory records and make better operational decisions. The current release is intentionally focused on inventory and stock operations, while integrations, accounting, procurement, and advanced automation remain separate future areas.

For installation, database configuration, migration, testing, and deployment instructions, see [`SETUP.md`](SETUP.md). For a record of implemented improvements, see [`CHANGES.md`](CHANGES.md).
