# ADR-0003: Provider Abstraction – Gemini/OpenAI/Anthropic

**Status**: Accepted
**Date**: 2025-11-02
**Deciders**: Project Team

## Context
Need to:
- Migrate away from Google Labs dependency
- Support cost/quality trade-offs
- Provide resilience against single-provider outages
- Enable users to choose their preferred provider

## Decision
Implement a provider abstraction layer with adapters for:
1. **Google Gemini** (primary, existing)
2. **OpenAI** (GPT-4, GPT-4o)
3. **Anthropic Claude** (Claude 3 family)

Model selection and routing decided per profile/job configuration. Provider API keys managed via environment variables.

## Rationale
1. **Portability**: No vendor lock-in
2. **Cost Optimization**: Different models for different use cases
3. **Quality Options**: Users can choose best model for their needs
4. **Resilience**: Automatic fallback if primary provider fails
5. **Future-Proof**: Easy to add new providers

## Consequences

### Positive
- Flexibility to optimize cost vs. quality
- Resilience against provider outages
- Competitive pricing leverage
- User choice and transparency

### Negative
- More complex testing (test matrix across providers)
- Need to normalize different API responses
- Cost tracking across multiple providers
- Rate limiting complexity

### Neutral
- Provider-specific features may not be available across all providers
- Need to maintain API key rotation for multiple providers

## Implementation Notes

### Provider Interface
```python
class LLMProvider(ABC):
    @abstractmethod
    async def complete(self, prompt: str, **kwargs) -> CompletionResponse:
        pass

    @abstractmethod
    def estimate_cost(self, input_tokens: int, output_tokens: int) -> Decimal:
        pass

    @abstractmethod
    def get_model_info(self) -> ModelInfo:
        pass
```

### Routing Strategy
- Profile-level default provider
- Job-level override capability
- Automatic fallback on provider errors
- Cost-based routing (future)

## Alternatives Considered

### Alternative A: Single provider (Gemini only)
**Pros**: Simpler implementation
**Cons**: Vendor lock-in, no resilience, limited cost optimization

### Alternative B: LiteLLM/LangChain provider abstraction
**Pros**: Less code to maintain
**Cons**: Additional dependency, less control over provider-specific features

## References
- SPEC §5, §8, §9
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
