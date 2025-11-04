"""LLM provider factory and exports."""

from typing import Optional
from app.services.llm.base import BaseLLMProvider, LLMResponse
from app.services.llm.gemini import GeminiProvider
from app.config.settings import get_settings


class LLMProviderFactory:
    """Factory for creating LLM providers."""

    @staticmethod
    def create(
        provider: str,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
    ) -> BaseLLMProvider:
        """Create an LLM provider instance.

        Args:
            provider: Provider name ('gemini', 'openai', 'anthropic')
            api_key: API key (if None, uses settings)
            model: Model to use (provider-specific)

        Returns:
            Provider instance

        Raises:
            ValueError: If provider is unknown or API key is missing
        """
        settings = get_settings()

        if provider.lower() == "gemini":
            key = api_key or settings.GEMINI_API_KEY
            if not key:
                raise ValueError("Gemini API key not configured")
            return GeminiProvider(api_key=key, model=model)

        elif provider.lower() == "openai":
            # TODO: Implement OpenAI provider
            raise NotImplementedError("OpenAI provider not yet implemented")

        elif provider.lower() == "anthropic":
            # TODO: Implement Anthropic provider
            raise NotImplementedError("Anthropic provider not yet implemented")

        else:
            raise ValueError(f"Unknown provider: {provider}")


__all__ = ["BaseLLMProvider", "LLMResponse", "LLMProviderFactory"]
