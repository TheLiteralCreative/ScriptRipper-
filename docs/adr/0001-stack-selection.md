# ADR-0001: Stack Selection – Next.js + FastAPI + Python Workers

**Status**: Accepted
**Date**: 2025-11-02
**Deciders**: Project Team

## Context
Prototype was Python + Google Labs. We need a portable, web-ready stack supporting CLI/API/UI and close proximity to Python analysis logic.

## Decision
- **Frontend**: Next.js (deployed on Vercel) for web UI
- **API**: FastAPI for REST API layer
- **Workers**: Python workers for analysis tasks
- **Database**: Postgres as SSOT (Single Source of Truth)
- **Cache/Queue**: Redis for queue management and caching

## Rationale
1. **Python Workers**: Allows simple reuse of existing Python analysis logic and access to rich ML/NLP ecosystem
2. **FastAPI**: Modern, fast Python web framework with automatic OpenAPI documentation
3. **Next.js**: Production-ready React framework with excellent developer experience and deployment options
4. **Separation of Concerns**: Clear boundaries between presentation, API, and processing layers
5. **Scalability**: Each layer can be scaled independently

## Consequences

### Positive
- Leverage existing Python codebase for analysis logic
- Modern, type-safe development experience
- Clear separation of concerns
- Independent scaling of components
- Rich ecosystem for both Node.js and Python

### Negative
- Polyglot repo requires infrastructure for both Node.js and Python
- Additional complexity in deployment and monitoring
- Team needs familiarity with both ecosystems

### Neutral
- Need to maintain consistency across different language codebases
- API contracts become critical integration points

## Alternatives Considered

### Alternative A: All-Node (NestJS + TypeScript workers)
**Pros**: Single language, simpler deployment
**Cons**: Would require rewriting analysis logic, less access to Python ML libraries

### Alternative B: Pure-Python (FastAPI + Celery) with SSR
**Pros**: Single language
**Cons**: Less mature frontend tooling, more complex UI development

## References
- SPEC §8, §9, §13
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
