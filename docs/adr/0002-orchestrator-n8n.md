# ADR-0002: Orchestrator = n8n

**Status**: Accepted
**Date**: 2025-11-02
**Deciders**: Project Team

## Context
Need a solution for:
- Webhook handling and external integrations
- Retry logic for failed tasks
- Workflow orchestration
- Integration with external services (email, notifications, etc.)

## Decision
Use n8n as orchestration layer for webhooks, integrations, and workflow automation around the core Redis queue. Python workers remain the primary processing engine.

## Rationale
1. **Visual Workflow Editor**: Easy to modify workflows without code changes
2. **Rich Integration Library**: Pre-built connectors for common services
3. **Webhook Support**: Native webhook handling for external triggers
4. **Retry Logic**: Built-in retry and error handling
5. **Self-Hosted**: Can be deployed in our infrastructure for data privacy
6. **Low-Code Flexibility**: Quick iteration on integration workflows

## Consequences

### Positive
- Faster implementation of integrations and webhooks
- Visual debugging of workflows
- Non-developers can modify certain workflows
- Reduced custom code for common integration patterns

### Negative
- Additional service to deploy and maintain
- Another ops surface to monitor
- Potential vendor lock-in (though open-source mitigates this)
- Learning curve for team

### Neutral
- Workflow definitions stored in n8n (need backup strategy)
- Another component in the architecture diagram

## Alternatives Considered

### Alternative A: Apache Airflow
**Pros**: More powerful for data pipelines, Python-native
**Cons**: Heavier, more complex, overkill for webhook/integration needs

### Alternative B: Custom webhook service
**Pros**: Full control, minimal dependencies
**Cons**: Reinventing the wheel, high maintenance burden

### Alternative C: Temporal
**Pros**: Strong workflow orchestration, durable execution
**Cons**: Steeper learning curve, may be overkill for MVP

## References
- SPEC §8, §12
- [n8n Documentation](https://docs.n8n.io/)
