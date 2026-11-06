# user-auth Specification

## Purpose
Lets the people the owner has invited sign in to Fishcards with Google or GitHub, keeps everyone else out, and keeps each person's pages behind their own session.

## Requirements

### Requirement: Sign-in with Google or GitHub
The landing page SHALL offer sign-in with Google and with GitHub. There SHALL be no other way to create an account or sign in.

#### Scenario: Signed-out landing page
- **WHEN** a signed-out user opens the landing page
- **THEN** it shows a "Sign in with Google" and a "Sign in with GitHub" button

#### Scenario: Successful sign-in
- **WHEN** an allowed user completes sign-in with either provider
- **THEN** the user lands on their sets page in the language they started from

### Requirement: Email allowlist
Only a user whose provider reports a verified email that is on the owner's allowlist SHALL get in. Matching SHALL ignore letter case and surrounding spaces, and an empty allowlist SHALL admit no one.

#### Scenario: Email not on the allowlist
- **WHEN** a user signs in with a verified email that is not on the allowlist
- **THEN** no session is created and the landing page shows a message that this account has no access

#### Scenario: Unverified email
- **WHEN** a user signs in with an allowlisted email that the provider reports as unverified
- **THEN** no session is created and the landing page shows the no-access message

#### Scenario: Case and spaces ignored
- **WHEN** the allowlist contains ` Ann@Example.com ` and Ann signs in as `ann@example.com`
- **THEN** Ann gets in

### Requirement: Access ends when an email leaves the allowlist
A session SHALL only grant access while its user's email is still on the allowlist, checked on every request.

#### Scenario: Removed while signed in
- **WHEN** a signed-in user's email is removed from the allowlist and the user opens a protected page
- **THEN** the user is treated as signed out and redirected to the landing page

### Requirement: One account per verified email
Signing in with the second provider SHALL reuse the existing account when both providers report the same verified email, and SHALL NOT link accounts on an unverified email.

#### Scenario: Same verified email on both providers
- **WHEN** a user who signed in with Google later signs in with GitHub using the same verified email
- **THEN** both sign-ins open the same account and the same data

### Requirement: Protected pages
Pages that show a user's data SHALL require a valid session. The landing page SHALL stay public.

#### Scenario: Signed-out user opens a protected page
- **WHEN** a signed-out user opens `/pl/sets`
- **THEN** the user is redirected to `/pl`

#### Scenario: Signed-in user opens the landing page
- **WHEN** a signed-in user opens the landing page
- **THEN** the user is redirected to their sets page

### Requirement: Signed-in header and sign-out
While signed in, every page SHALL show the user's email and a sign-out button. Signing out SHALL end the session on the server.

#### Scenario: Sign out
- **WHEN** a signed-in user selects "Sign out"
- **THEN** the user lands on the landing page and opening a protected page again redirects there

#### Scenario: Sign-out fails
- **WHEN** a signed-in user selects "Sign out" and the request fails
- **THEN** the user stays on the current page and sees a localized message that signing out didn't work
