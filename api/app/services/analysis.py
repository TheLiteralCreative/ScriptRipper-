"""Transcript analysis service."""

from typing import Dict, Any
from decimal import Decimal

from app.models.profile import Profile
from app.services.llm import LLMProviderFactory


class AnalysisService:
    """Service for analyzing transcripts using LLM providers."""

    async def analyze_transcript(
        self,
        transcript: str,
        profile: Profile,
    ) -> Dict[str, Any]:
        """Analyze a transcript using the specified profile.

        Args:
            transcript: Raw transcript text
            profile: Analysis profile with prompts and configuration

        Returns:
            Dictionary with analysis results and metadata

        Example return:
            {
                "results": {
                    "summary": "Meeting discussed...",
                    "key_decisions": ["Decision 1", "Decision 2"],
                    ...
                },
                "metadata": {
                    "profile_key": "meetings",
                    "profile_version": 1,
                    "provider": "gemini",
                    "model": "gemini-1.5-pro-latest",
                    "input_tokens": 1234,
                    "output_tokens": 567,
                    "total_cost": 0.0123
                }
            }
        """
        # Create LLM provider
        provider = LLMProviderFactory.create(
            provider=profile.provider.value,
            model=profile.model,
        )

        # Get prompts configuration
        system_prompt = profile.prompts.get("system", "")
        tasks = profile.prompts.get("tasks", {})

        # Track metrics
        total_input_tokens = 0
        total_output_tokens = 0
        total_cost = Decimal("0.00")

        # Execute each task
        results = {}
        for task_name, task_prompt in tasks.items():
            # Build full prompt with transcript
            full_prompt = f"""
TRANSCRIPT:
{transcript}

TASK:
{task_prompt}
"""

            # Generate response
            response = await provider.generate(
                prompt=full_prompt.strip(),
                system_prompt=system_prompt,
                temperature=0.7,
            )

            # Store result
            results[task_name] = response.content

            # Accumulate metrics
            total_input_tokens += response.input_tokens
            total_output_tokens += response.output_tokens
            if response.cost:
                total_cost += Decimal(str(response.cost))

        return {
            "results": results,
            "metadata": {
                "profile_key": profile.key,
                "profile_version": profile.version,
                "provider": provider.provider_name,
                "model": response.model,
                "input_tokens": total_input_tokens,
                "output_tokens": total_output_tokens,
                "total_tokens": total_input_tokens + total_output_tokens,
                "total_cost": float(total_cost),
            },
        }
