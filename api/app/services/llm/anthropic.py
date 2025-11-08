"""Anthropic (Claude) LLM provider."""

from typing import Optional
from anthropic import AsyncAnthropic

from app.services.llm.base import BaseLLMProvider, LLMResponse
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


# Anthropic pricing per 1M tokens (as of January 2025)
# Source: https://www.anthropic.com/pricing
ANTHROPIC_PRICING = {
    # Claude 4.5 Sonnet (latest)
    "claude-sonnet-4-5-20250929": {"input": 3.00, "output": 15.00},
    "claude-4-5-sonnet": {"input": 3.00, "output": 15.00},

    # Claude 4.5 Haiku
    "claude-haiku-4-5-20250929": {"input": 0.25, "output": 1.25},
    "claude-4-5-haiku": {"input": 0.25, "output": 1.25},

    # Claude 4.1 Opus
    "claude-opus-4-1-20250514": {"input": 15.00, "output": 75.00},
    "claude-4-1-opus": {"input": 15.00, "output": 75.00},

    # Claude 4.1 Sonnet
    "claude-sonnet-4-1-20250514": {"input": 5.00, "output": 25.00},
    "claude-4-1-sonnet": {"input": 5.00, "output": 25.00},

    # Claude 3.5 Sonnet
    "claude-3-5-sonnet-20241022": {"input": 3.00, "output": 15.00},
    "claude-3-5-sonnet-20240620": {"input": 3.00, "output": 15.00},

    # Claude 3.5 Haiku
    "claude-3-5-haiku-20241022": {"input": 0.80, "output": 4.00},

    # Claude 3 Opus
    "claude-3-opus-20240229": {"input": 15.00, "output": 75.00},

    # Claude 3 Sonnet
    "claude-3-sonnet-20240229": {"input": 3.00, "output": 15.00},

    # Claude 3 Haiku
    "claude-3-haiku-20240307": {"input": 0.25, "output": 1.25},

    # Legacy models
    "claude-2.1": {"input": 8.00, "output": 24.00},
    "claude-2.0": {"input": 8.00, "output": 24.00},
    "claude-instant-1.2": {"input": 0.80, "output": 2.40},
}


class AnthropicProvider(BaseLLMProvider):
    """Anthropic (Claude) provider implementation."""

    def __init__(self, api_key: str, model: Optional[str] = None):
        """Initialize Anthropic provider.

        Args:
            api_key: Anthropic API key
            model: Model to use (default: claude-3-5-sonnet-20241022)
        """
        super().__init__(api_key, model or "claude-3-5-sonnet-20241022")
        self.client = AsyncAnthropic(api_key=self.api_key)

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        **kwargs,
    ) -> LLMResponse:
        """Generate completion using Anthropic Claude.

        Args:
            prompt: User prompt
            system_prompt: System instruction
            temperature: Sampling temperature (0.0-1.0)
            max_tokens: Maximum output tokens (REQUIRED by Anthropic)
            **kwargs: Additional Anthropic parameters

        Returns:
            LLMResponse with generated content
        """
        # Anthropic requires max_tokens, default to 4096 if not specified
        if max_tokens is None:
            max_tokens = 4096

        # Build messages array
        messages = [{"role": "user", "content": prompt}]

        # Configure parameters
        params = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        # Add system prompt if provided
        if system_prompt:
            params["system"] = system_prompt

        # Add any additional Anthropic-specific params
        if "top_p" in kwargs:
            params["top_p"] = kwargs["top_p"]
        if "top_k" in kwargs:
            params["top_k"] = kwargs["top_k"]

        # Generate completion
        logger.debug(f"Calling Anthropic API with model: {self.model}")
        response = await self.client.messages.create(**params)

        # Extract response data
        content = response.content[0].text
        input_tokens = response.usage.input_tokens
        output_tokens = response.usage.output_tokens

        # Calculate cost
        cost = self.calculate_cost(input_tokens, output_tokens, self.model)

        logger.debug(
            f"Anthropic response: {output_tokens} tokens, ${cost:.4f}"
        )

        return LLMResponse(
            content=content,
            model=self.model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost=cost,
            metadata={
                "total_tokens": input_tokens + output_tokens,
                "stop_reason": response.stop_reason,
                "model_used": response.model,  # Actual model used by API
            },
        )

    def calculate_cost(
        self, input_tokens: int, output_tokens: int, model: str
    ) -> float:
        """Calculate cost for Anthropic usage.

        Args:
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            model: Model name

        Returns:
            Cost in USD
        """
        # Default to Claude 3.5 Sonnet pricing if model not found
        pricing = ANTHROPIC_PRICING.get(
            model, ANTHROPIC_PRICING["claude-3-5-sonnet-20241022"]
        )

        input_cost = (input_tokens / 1_000_000) * pricing["input"]
        output_cost = (output_tokens / 1_000_000) * pricing["output"]

        return round(input_cost + output_cost, 6)

    @property
    def provider_name(self) -> str:
        """Get provider name."""
        return "anthropic"
