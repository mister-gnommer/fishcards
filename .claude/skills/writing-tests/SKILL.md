---
name: writing-tests
ver: 1
description: Rules for deciding what is worth testing. Use when writing or editing tests in any language.
---

# Writing tests

Every test must be able to fail because of a realistic bug you can name. If you can't name one, don't write the test.

## Don't test
- Mocks: asserting a mocked value comes back unchanged.
- The language, runtime or libraries: that `if`, `map` or the framework works.
- Trivial code: getters, constants, pass-through wrappers, plain data shapes.

## Do test
- Business logic, branching, edge cases (empty, boundary, error paths).
- Bug fixes: one regression test that reproduces the bug.
- Contracts at module boundaries.

## Size
A few meaningful tests beat exhaustive coverage. Match the project's existing test density. If a case is borderline, skip it and mention it instead.
