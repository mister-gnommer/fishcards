---
name: python-testing
description: Use when writing or editing Python tests. Covers what to test, mocking discipline, test data conventions, assertion style, and file structure for pytest/unittest.
---

- **What to test:** real behaviors and edge cases, not trivial arithmetic or "test that a function exists." Each test should exercise a distinct code path with meaningful input.
- **No mock-for-mock's-sake:** never mock a function just to assert it was called with certain args and returned a fixed value. That tests the mock, not the code. Prefer integration tests against real dependencies when the unit boundary is artificial.
- **Test data:** use Lorem Ipsum or clearly fake text in constants — never real production data in test fixtures. Keep test data paired: input constant + expected-output constant so they can't drift.
- **Assertions:** plain `assert` — no assertion libraries. Prefer comparing whole objects (`assert result == expected`) over field-by-field when possible.
- **Structure:** constants at module top, test functions below. One convention per file — don't mix inline data and constants for the same kind of test.
