# ADR-0005: Auth Model – Magic Link + Google OAuth

**Status**: Accepted
**Date**: 2025-11-02
**Deciders**: Project Team

## Context
Need a low-friction authentication system for MVP that:
- Minimizes user friction (no passwords to remember)
- Supports single-tenant deployment
- Provides API token generation for CLI
- Enables basic role-based access control

## Decision
Implement dual authentication methods:
1. **Magic Link** (passwordless email authentication)
2. **Google OAuth 2.0** (social login)

**Token Strategy:**
- JWT tokens for web sessions
- Long-lived API tokens for CLI access
- Simple role system: Admin and User

## Rationale
1. **Passwordless**: Eliminates password management friction
2. **Familiar**: Google OAuth is widely recognized and trusted
3. **Low PII**: Minimal personal information collected (email, name)
4. **Developer Friendly**: Easy API token generation for CLI
5. **Fast Implementation**: Proven patterns, many libraries available

## Consequences

### Positive
- Low friction user onboarding
- No password management overhead
- Familiar social login option
- Simple API token strategy for CLI

### Negative
- Requires email sending infrastructure
- Google OAuth dependency (mitigated by magic link fallback)
- Magic links can be intercepted (mitigated by short expiry)

### Neutral
- Need email provider (SendGrid, Postmark, etc.)
- JWT token refresh strategy needed

## Implementation Details

### Magic Link Flow
1. User enters email
2. System generates short-lived signed token
3. Token sent via email
4. User clicks link → authenticated
5. Session established with JWT

### Google OAuth Flow
1. User clicks "Sign in with Google"
2. OAuth redirect to Google
3. Google returns with authorization code
4. System exchanges for user info
5. User created/updated in DB
6. Session established with JWT

### API Token Management
- Generate via web UI or CLI command
- Scoped to user account
- Can be revoked individually
- Logged for audit trail

### Role-Based Access Control (RBAC)
**Admin Role:**
- Create, update, delete profiles
- View all users and jobs (within tenant)
- Configure system settings

**User Role:**
- Create and manage own jobs
- View/use published profiles
- Cannot modify profiles

## Security Considerations
- Magic link tokens: 15-minute expiry, single-use
- JWT tokens: Short expiry (1 hour), refresh token pattern
- API tokens: Long-lived but revocable, rate-limited
- All tokens stored hashed in database
- HTTPS required for all auth endpoints

## Alternatives Considered

### Alternative A: Traditional username/password
**Pros**: No external dependencies, familiar
**Cons**: Password management overhead, security risks, user friction

### Alternative B: Auth0 or similar auth service
**Pros**: Fully managed, feature-rich
**Cons**: Additional cost, vendor dependency, overkill for MVP

### Alternative C: Passwordless via SMS
**Pros**: No email required
**Cons**: SMS costs, phone number PII, less reliable delivery

## References
- SPEC §7, §10
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
