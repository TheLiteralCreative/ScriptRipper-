# ADR-0006: Hosting – Vercel + Render/Cloud Run

**Status**: Accepted
**Date**: 2025-11-02
**Deciders**: Project Team

## Context
Need hosting infrastructure that:
- Separates web frontend from API/worker backend
- Scales independently per component
- Provides simple deployment workflows
- Offers managed databases and Redis
- Fits within startup budget

## Decision
**Web Frontend**: Deploy on Vercel
**API & Workers**: Deploy on Render or Google Cloud Run
**Database**: Managed PostgreSQL (Render, Supabase, or Cloud SQL)
**Cache/Queue**: Managed Redis (Render, Upstash, or Cloud Memorystore)
**Object Storage**: S3-compatible (Cloudflare R2, Backblaze B2)

## Rationale

### Vercel (Web)
1. **Next.js Native**: Built by same team, optimized deployment
2. **Edge Network**: Global CDN for fast page loads
3. **Preview Deployments**: Automatic preview URLs for PRs
4. **Simple CI/CD**: Git push → deploy
5. **Generous Free Tier**: Good for early stage

### Render or Cloud Run (API/Workers)
1. **Container Support**: Deploy FastAPI and Python workers
2. **Auto-scaling**: Scale to zero, scale up on demand
3. **Managed Services**: Postgres and Redis included (Render)
4. **Simple Pricing**: Predictable costs
5. **Docker-based**: Flexible deployment

## Consequences

### Positive
- Clear separation of concerns
- Independent scaling per service
- Simple deployment workflows
- Managed infrastructure reduces ops burden
- Preview environments for testing

### Negative
- Multi-provider operations (different dashboards)
- Cross-provider networking considerations
- Slightly more complex than monolithic deployment

### Neutral
- Need to manage environment variables across platforms
- Monitoring spans multiple services
- Cost tracking across providers

## Deployment Strategy

### Environments
- **Development**: Local Docker Compose
- **Staging**: Render/Cloud Run staging + Vercel preview
- **Production**: Render/Cloud Run prod + Vercel prod

### CI/CD Pipeline
```
git push → GitHub Actions
  ├─> Build + Test
  ├─> Deploy Web (Vercel)
  ├─> Build Docker Images (API, Worker)
  └─> Deploy to Render/Cloud Run
```

### Database Migrations
- Run via GitHub Actions before API deployment
- Alembic migrations
- Rollback plan for failed migrations

## Cost Estimates (Monthly)

### MVP/Early Stage
- Vercel: $0 (hobby) → $20 (pro)
- Render: $7 (Postgres) + $7 (Redis) + $7-25 (services)
- Object Storage: ~$5-10
- **Total**: ~$25-65/month

### Growth Stage
- Vercel: $20 (pro)
- Render/Cloud Run: $50-200 (scaled services)
- Database: $25-100 (larger instance)
- **Total**: ~$100-350/month

## Alternatives Considered

### Alternative A: AWS (EC2, RDS, ElastiCache)
**Pros**: Full control, mature ecosystem
**Cons**: High complexity, more ops burden, steeper learning curve

### Alternative B: Heroku
**Pros**: Simple, all-in-one
**Cons**: Higher cost, less flexible, deprecated free tier

### Alternative C: Self-hosted (DigitalOcean, Linode)
**Pros**: Lower cost at scale
**Cons**: Full ops burden, no managed services

### Alternative D: All-in on Google Cloud
**Pros**: Single vendor, integrated services
**Cons**: More complex than Render, higher learning curve

## Migration Path
If outgrow Render/Cloud Run:
1. Move to Kubernetes (GKE, EKS)
2. Keep Vercel for web (works with any API)
3. Database migration path clear (Postgres dump/restore)

## References
- SPEC §6, §13
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
