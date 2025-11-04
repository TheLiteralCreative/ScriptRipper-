"""Google Gemini LLM provider."""

from typing import Optional
import google.generativeai as genai

from app.services.llm.base import BaseLLMProvider, LLMResponse


# Gemini pricing per 1M tokens (as of 2025)
GEMINI_PRICING = {
    "models/gemini-2.5-flash": {"input": 0.35, "output": 1.05},
    "models/gemini-2.5-pro": {"input": 3.50, "output": 10.50},
    "models/gemini-flash-latest": {"input": 0.35, "output": 1.05},
    "models/gemini-pro-latest": {"input": 3.50, "output": 10.50},
    # Legacy models (deprecated)
    "gemini-1.5-pro-latest": {"input": 3.50, "output": 10.50},
    "gemini-1.5-pro": {"input": 3.50, "output": 10.50},
    "gemini-1.5-flash": {"input": 0.35, "output": 1.05},
    "gemini-1.5-flash-latest": {"input": 0.35, "output": 1.05},
    "gemini-pro": {"input": 0.50, "output": 1.50},
}


class GeminiProvider(BaseLLMProvider):
    """Google Gemini provider implementation."""

    def __init__(self, api_key: str, model: Optional[str] = None):
        """Initialize Gemini provider.

        Args:
            api_key: Google API key
            model: Model to use (default: models/gemini-2.5-flash)
        """
        super().__init__(api_key, model or "models/gemini-2.5-flash")
        genai.configure(api_key=self.api_key)

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        **kwargs,
    ) -> LLMResponse:
        """Generate completion using Gemini.

        Args:
            prompt: User prompt
            system_prompt: System instruction
            temperature: Sampling temperature (0.0-2.0)
            max_tokens: Maximum output tokens
            **kwargs: Additional Gemini parameters

        Returns:
            LLMResponse with generated content
        """
        # Configure generation parameters
        generation_config = {
            "temperature": temperature,
            "top_p": kwargs.get("top_p", 0.95),
            "top_k": kwargs.get("top_k", 40),
        }

        if max_tokens:
            generation_config["max_output_tokens"] = max_tokens

        # Create model with system instruction
        model_kwargs = {"model_name": self.model}
        if system_prompt:
            model_kwargs["system_instruction"] = system_prompt

        model = genai.GenerativeModel(**model_kwargs)

        # Generate content
        response = await model.generate_content_async(
            prompt,
            generation_config=generation_config,
        )

        # Extract token counts
        input_tokens = response.usage_metadata.prompt_token_count
        output_tokens = response.usage_metadata.candidates_token_count
        total_tokens = response.usage_metadata.total_token_count

        # Calculate cost
        cost = self.calculate_cost(input_tokens, output_tokens, self.model)

        return LLMResponse(
            content=response.text,
            model=self.model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost=cost,
            metadata={
                "total_tokens": total_tokens,
                "finish_reason": response.candidates[0].finish_reason.name
                if response.candidates
                else None,
            },
        )

    def calculate_cost(
        self, input_tokens: int, output_tokens: int, model: str
    ) -> float:
        """Calculate cost for Gemini usage.

        Args:
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            model: Model name

        Returns:
            Cost in USD
        """
        pricing = GEMINI_PRICING.get(model, GEMINI_PRICING["models/gemini-2.5-flash"])

        input_cost = (input_tokens / 1_000_000) * pricing["input"]
        output_cost = (output_tokens / 1_000_000) * pricing["output"]

        return round(input_cost + output_cost, 6)

    @property
    def provider_name(self) -> str:
        """Get provider name."""
        return "gemini"
