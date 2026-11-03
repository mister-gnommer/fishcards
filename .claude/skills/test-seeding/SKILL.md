---
name: test-seeding
description: When creating or editing test files that seed a database (including in-memory or other temporary test databases)
---

- When creating or editing test files that seed a database (inserts, upserts, fixtures, migrations), always add a comment showing the expected state of the data after seeding completes.
- The comment should list tables with row counts and key column values, e.g.: `// After seeding: users has 3 rows (ids 1-3, roles admin/editor/viewer), posts has 5 rows (user_id references 1-3)`.
