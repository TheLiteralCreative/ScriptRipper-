"""Transcript analysis service."""

import sys
from pathlib import Path
from typing import Dict, Any

# Add shared path for shared analysis engine
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "shared"))

from app.models.profile import Profile
from app.services.llm import LLMProviderFactory
from analysis_engine import TranscriptAnalyzer


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

        # Use shared analysis engine
        result = await TranscriptAnalyzer.analyze(
            llm_provider=provider,
            transcript=transcript,
            system_prompt=system_prompt,
            tasks=tasks,
            temperature=0.7,
            extra_metadata={
                "profile_key": profile.key,
                "profile_version": profile.version,
            }
        )

        return {
            "results": result.results,
            "metadata": result.metadata,
        }
