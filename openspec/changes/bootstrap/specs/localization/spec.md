# Spec Delta

## Purpose

Lets people use Fishcards in English or Polish: every page lives under a language-specific URL, the app picks a sensible language on the first visit, remembers the user's choice, and never shows a half-translated interface.

## ADDED Requirements

### Requirement: Supported interface languages
The system SHALL offer the interface in English (`en`) and Polish (`pl`), with English as the fallback language.

#### Scenario: Both languages are available
- **WHEN** a user opens `/en` or `/pl`
- **THEN** the page is shown in English or Polish respectively

### Requirement: Locale in the URL
Every page SHALL be served under a path that starts with its locale (`/en/...` or `/pl/...`). A path starting with an unsupported locale-like segment that matches no page SHALL return "not found".

#### Scenario: Prefixed page
- **WHEN** a user opens `/pl`
- **THEN** the home page is shown in Polish and the URL stays `/pl`

#### Scenario: Unsupported locale
- **WHEN** a user opens `/de`
- **THEN** the system responds with "not found"

### Requirement: Language detection for unprefixed paths
When a request has no locale prefix, the system SHALL redirect to the same path under a locale chosen in this order: the language the user last chose, then the best match from the browser's preferred languages, then English.

#### Scenario: Remembered choice wins
- **WHEN** a user who last chose Polish opens `/` with a browser that prefers English
- **THEN** the system redirects to `/pl`

#### Scenario: Browser language on first visit
- **WHEN** a first-time user opens `/` with a browser that prefers Polish
- **THEN** the system redirects to `/pl`

#### Scenario: Fallback to English
- **WHEN** a first-time user opens `/` with a browser that prefers only languages the app does not support
- **THEN** the system redirects to `/en`

### Requirement: Switching language
Every page SHALL offer a language switcher that opens the same page in the other language and remembers that choice for later visits.

#### Scenario: Switch and remember
- **WHEN** a user on `/en` switches to Polish, and later opens `/`
- **THEN** the user lands on `/pl` both times

### Requirement: Complete translations
Every user-facing text SHALL come from per-language translations, and the English and Polish translations SHALL define the same set of texts. The page's declared document language SHALL match its locale.

#### Scenario: Missing translation is caught before release
- **WHEN** a text exists in one language's translations but not in the other's
- **THEN** the automated checks fail and the change cannot be deployed

#### Scenario: Document language
- **WHEN** a user opens `/pl`
- **THEN** the page declares Polish as its document language
