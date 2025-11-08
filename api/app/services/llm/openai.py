"""OpenAI LLM provider."""

from typing import Optional
from openai import AsyncOpenAI

from app.services.llm.base import BaseLLMProvider, LLMResponse
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


# OpenAI pricing per 1M tokens (as of January 2025)
# Source: https://openai.com/pricing
OPENAI_PRICING = {
    "gpt-4": {"input": 30.00, "output": 60.00},
    "gpt-4-turbo": {"input": 10.00, "output": 30.00},
    "gpt-4-turbo-preview": {"input": 10.00, "output": 30.00},
    "gpt-4-turbo-2024-04-09": {"input": 10.00, "output": 30.00},
    "gpt-4-0125-preview": {"input": 10.00, "output": 30.00},
    "gpt-4-1106-preview": {"input": 10.00, "output": 30.00},
    "gpt-4o": {"input": 2.50, "output": 10.00},
    "gpt-4o-2024-11-20": {"input": 2.50, "output": 10.00},
    "gpt-4o-2024-08-06": {"input": 2.50, "output": 10.00},
    "gpt-4o-2024-05-13": {"input": 5.00, "output": 15.00},
    "gpt-4o-mini": {"input": 0.15, "output": 0.60},
    "gpt-4o-mini-2024-07-18": {"input": 0.15, "output": 0.60},
    "gpt-3.5-turbo": {"input": 0.50, "output": 1.50},
    "gpt-3.5-turbo-0125": {"input": 0.50, "output": 1.50},
    "gpt-3.5-turbo-1106": {"input": 1.00, "output": 2.00},
    "gpt-3.5-turbo-16k": {"input": 3.00, "output": 4.00},
}


class OpenAIProvider(BaseLLMProvider):
    """OpenAI provider implementation."""

    def __init__(self, api_key: str, model: Optional[str] = None):
        """Initialize OpenAI provider.

        Args:
            api_key: OpenAI API key
            model: Model to use (default: gpt-3.5-turbo)
        """
        super().__init__(api_key, model or "gpt-3.5-turbo")
        self.client = AsyncOpenAI(api_key=self.api_key)

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        **kwargs,
    ) -> LLMResponse:
        """Generate completion using OpenAI.

        Args:
            prompt: User prompt
            system_prompt: System instruction
            temperature: Sampling temperature (0.0-2.0)
            max_tokens: Maximum output tokens
            **kwargs: Additional OpenAI parameters

        Returns:
            LLMResponse with generated content
        """
        # Build messages array
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        # Configure parameters
        params = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
        }

        if max_tokens:
            params["max_tokens"] = max_tokens

        # Add any additional OpenAI-specific params
        if "top_p" in kwargs:
            params["top_p"] = kwargs["top_p"]
        if "frequency_penalty" in kwargs:
            params["frequency_penalty"] = kwargs["frequency_penalty"]
        if "presence_penalty" in kwargs:
            params["presence_penalty"] = kwargs["presence_penalty"]

        # Generate completion
        logger.debug(f"Calling OpenAI API with model: {self.model}")
        response = await self.client.chat.completions.create(**params)

        # Extract response data
        content = response.choices[0].message.content
        input_tokens = response.usage.prompt_tokens
        output_tokens = response.usage.completion_tokens
        total_tokens = response.usage.total_tokens

        # Calculate cost
        cost = self.calculate_cost(input_tokens, output_tokens, self.model)

        logger.debug(
            f"OpenAI response: {output_tokens} tokens, ${cost:.4f}"
        )

        return LLMResponse(
            content=content,
            model=self.model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost=cost,
            metadata={
                "total_tokens": total_tokens,
                "finish_reason": response.choices[0].finish_reason,
                "model_used": response.model,  # Actual model used by API
            },
        )

    def calculate_cost(
        self, input_tokens: int, output_tokens: int, model: str
    ) -> float:
        """Calculate cost for OpenAI usage.

        Args:
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            model: Model name

        Returns:
            Cost in USD
        """
        # Default to gpt-3.5-turbo pricing if model not found
        pricing = OPENAI_PRICING.get(
            model, OPENAI_PRICING["gpt-3.5-turbo"]
        )

        input_cost = (input_tokens / 1_000_000) * pricing["input"]
        output_cost = (output_tokens / 1_000_000) * pricing["output"]

        return round(input_cost + output_cost, 6)

    @property
    def provider_name(self) -> str:
        """Get provider name."""
        return "openai"
