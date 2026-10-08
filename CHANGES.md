# Inventory improvements

- Replaced automatic manager login and email-based demo roles with hashed passwords, expiring server sessions, logout, and API-enforced permissions.
- Added branch-owned inventory, administrator branch/account creation, manager branch restrictions, and employee read/request access.
- Added material requests with manual job references and pending/approved/denied/fulfilled states. Issuance deducts stock once; failed issuance leaves the request approved.
- Added completed branch transfers with paired ledger entries and shared reference IDs.
- Made stock updates and their ledger entries transactional. Insufficient stock is rejected instead of clamped to zero, including concurrent dispatches.
- Added input validation, fractional material quantities, whole-number constraints for countable items, unique branch/SKU identities, and fixed zero reorder thresholds.
- Made specifications editable only by managers/admins. Quantities change through movements; SKU and measurement unit remain stable after registration.
- Replaced destructive item deletion with archive/restore, with checks for remaining stock and open requests.
- Added full-history server-side ledger search/pagination, product IDs, users, before/after balances, reference links, and Philippine-time display.
- Separated cost estimates from potential sales values and grouped quantities by unit of measure.
- Added visible load/save errors, forms that retain values after failures, branch-response cleanup, configurable API URLs, and a truthful database health response.
- Simplified the dashboard, catalog forms, and navigation to the later React/Ant Design/Axios lesson scope; removed unused old sidebar/topbar/icon implementations and their advanced hooks.
- Added explicit, transactional legacy-data migration and first-administrator setup. Existing database contents and production services were not modified during development.
- Replaced the scaffold React test with functional checks, added isolated MongoDB integration tests, and added a headless browser walkthrough.

See `SETUP.md` for operation and migration, and `LESSON_ALIGNMENT.md` for the lesson mapping and the limited security/transaction exceptions.
