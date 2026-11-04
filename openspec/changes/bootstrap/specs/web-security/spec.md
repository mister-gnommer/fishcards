# Spec Delta

## Purpose

Tells browsers to apply their built-in protections to every Fishcards page, so the app cannot be embedded by other sites, served content is never reinterpreted, and the connection stays on HTTPS.

## ADDED Requirements

### Requirement: Browser hardening headers
Every page response SHALL instruct the browser to refuse showing the page inside another site's frame, to never guess content types, and to use only HTTPS for this domain.

#### Scenario: Page cannot be framed
- **WHEN** a user opens any page
- **THEN** the response forbids embedding the page in frames on other sites

#### Scenario: No content sniffing
- **WHEN** a user opens any page
- **THEN** the response tells the browser not to guess the content type

#### Scenario: HTTPS enforced
- **WHEN** a user opens any page
- **THEN** the response tells the browser to use only HTTPS for this domain
