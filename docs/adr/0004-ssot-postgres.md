# ADR-0004: SSOT = Postgres

**Status**: Accepted
**Date**: 2025-11-02
**Deciders**: Project Team

## Context
Need a durable, canonical data store for:
- User accounts and authentication
- Job definitions and status
- Profile configurations and versions
- Artifact metadata
- Audit logs

## Decision
Use **PostgreSQL** as the Single Source of Truth (SSOT) for all persistent application data. Redis will be used exclusively for ephemeral queue and cache data.

## Rationale
1. **ACID Compliance**: Strong consistency guarantees for critical data
2. **Rich Query Capabilities**: Complex queries for reporting and analytics
3. **JSON Support**: Native JSONB for flexible schema elements (profile configs, metadata)
4. **Mature Ecosystem**: Well-understood, battle-tested, extensive tooling
5. **Migration Support**: Alembic for schema versioning
6. **Managed Options**: Available on all major cloud providers

## Consequences

### Positive
- Strong data consistency and integrity
- Rich querying capabilities
- Excellent backup and recovery tools
- JSON support for semi-structured data
- Well-understood operations

### Negative
- Need to manage backups and replication
- Schema migrations required (though managed via Alembic)
- Slightly more operational overhead than NoSQL alternatives

### Neutral
- Connection pooling required for scalability
- Need monitoring for query performance

## Schema Strategy
- Use SQLAlchemy ORM with declarative models
- Alembic for migrations
- JSONB columns for flexible metadata
- Proper indexing on frequently queried fields
- Foreign key constraints for referential integrity

## Data Model (High-Level)
```sql
-- Core tables
users(id, email, name, role, created_at, updated_at)
profiles(id, key, version, schema, prompts, status, created_at, updated_at)
jobs(id, user_id, profile_id, status, input_uri, metrics, cost, created_at, completed_at)
artifacts(id, job_id, kind, uri, checksum, size, created_at)
custom_prompts(id, job_id, prompt, result_artifact_id, created_at)
```

## Alternatives Considered

### Alternative A: MongoDB
**Pros**: Flexible schema, horizontal scaling
**Cons**: Eventual consistency, less mature for transactional workloads

### Alternative B: MySQL
**Pros**: Similar to Postgres, slightly more managed options
**Cons**: Less feature-rich (especially JSON support), less extensible

### Alternative C: SQLite (for prototype)
**Pros**: Zero configuration, embedded
**Cons**: Not suitable for production, no concurrent writes

## References
- SPEC §8, §9
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
