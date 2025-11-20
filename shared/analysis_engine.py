"""Shared transcript analysis engine for API and Worker."""

from typing import Dict, Any, Optional, List
from decimal import Decimal
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class AnalysisResult:
    """Result of a transcript analysis."""
    results: Dict[str, str]
    metadata: Dict[str, Any]


class TranscriptAnalyzer:
    """Shared analysis engine for processing transcripts with LLM providers."""

    @staticmethod
    async def analyze(
        llm_provider,
        transcript: str,
        system_prompt: str,
        tasks: Dict[str, str],
        temperature: float = 0.7,
        extra_metadata: Optional[Dict[str, Any]] = None,
    ) -> AnalysisResult:
        """
        Analyze a transcript using the provided LLM provider and tasks.

        This is the core analysis logic shared between API and Worker.

        Args:
            llm_provider: LLM provider instance (from LLMProviderFactory)
            transcript: Raw transcript text to analyze
            system_prompt: System/context prompt for the LLM
            tasks: Dictionary of {task_name: task_prompt}
            temperature: LLM temperature setting (default: 0.7)
            extra_metadata: Additional metadata to include in response

        Returns:
            AnalysisResult with results and metadata

        Example:
            provider = LLMProviderFactory.create("gemini", "gemini-2.5-flash")
            result = await TranscriptAnalyzer.analyze(
                llm_provider=provider,
                transcript="Meeting transcript...",
                system_prompt="You are an expert analyst.",
                tasks={
                    "summary": "Provide a brief summary",
                    "action_items": "List all action items"
                }
            )
        """
        # Track metrics
        total_input_tokens = 0
        total_output_tokens = 0
        total_cost = Decimal("0.00")

        # Execute each task
        results = {}
        last_response = None

        for task_name, task_prompt in tasks.items():
            logger.debug(f"Processing task: {task_name}")

            # Build full prompt with transcript
            full_prompt = f"""TRANSCRIPT:
{transcript}

TASK:
{task_prompt}"""

            # Generate response
            response = await llm_provider.generate(
                prompt=full_prompt.strip(),
                system_prompt=system_prompt,
                temperature=temperature,
            )

            # Store result
            results[task_name] = response.content
            last_response = response

            # Accumulate metrics
            total_input_tokens += response.input_tokens
            total_output_tokens += response.output_tokens
            if response.cost:
                total_cost += Decimal(str(response.cost))

            logger.debug(f"Completed {task_name}: {response.output_tokens} tokens")

        # Build metadata
        metadata = {
            "provider": llm_provider.provider_name,
            "model": last_response.model if last_response else "unknown",
            "input_tokens": total_input_tokens,
            "output_tokens": total_output_tokens,
            "total_tokens": total_input_tokens + total_output_tokens,
            "total_cost": float(total_cost),
        }

        # Add any extra metadata
        if extra_metadata:
            metadata.update(extra_metadata)

        logger.info(
            f"Analysis complete: {len(tasks)} tasks, "
            f"{total_input_tokens + total_output_tokens} tokens, "
            f"${float(total_cost):.4f}"
        )

        return AnalysisResult(
            results=results,
            metadata=metadata,
        )

    @staticmethod
    async def analyze_batch(
        llm_provider,
        transcript: str,
        tasks: List[Dict[str, str]],
        system_prompt: str = "You are an expert at analyzing transcripts.",
        temperature: float = 0.7,
    ) -> Dict[str, Any]:
        """
        Analyze a transcript with multiple tasks in batch mode.

        Each task result includes individual metrics.

        Args:
            llm_provider: LLM provider instance
            transcript: Raw transcript text
            tasks: List of {task_name: str, prompt: str} dictionaries
            system_prompt: System prompt for all tasks
            temperature: LLM temperature setting

        Returns:
            Dictionary with results array and aggregated metadata

        Example:
            {
                "results": [
                    {
                        "task_name": "Summary",
                        "result": "...",
                        "input_tokens": 100,
                        "output_tokens": 50,
                        "cost": 0.01
                    },
                    ...
                ],
                "metadata": {
                    "total_input_tokens": 500,
                    "total_output_tokens": 200,
                    "total_cost": 0.05,
                    "model": "gemini-2.5-flash",
                    "provider": "gemini"
                }
            }
        """
        results = []
        total_input = 0
        total_output = 0
        total_cost = 0.0
        model_name = "unknown"

        # Process each task
        for task in tasks:
            task_name = task["task_name"]
            task_prompt = task["prompt"]

            logger.debug(f"Processing: {task_name}")

            # Build full prompt
            full_prompt = f"""TRANSCRIPT:
{transcript}

TASK:
{task_prompt}"""

            # Execute task
            response = await llm_provider.generate(
                prompt=full_prompt.strip(),
                system_prompt=system_prompt,
                temperature=temperature,
            )

            # Accumulate totals
            total_input += response.input_tokens
            total_output += response.output_tokens
            total_cost += response.cost or 0.0
            model_name = response.model

            results.append({
                "task_name": task_name,
                "result": response.content,
                "input_tokens": response.input_tokens,
                "output_tokens": response.output_tokens,
                "cost": response.cost or 0.0,
            })

            logger.debug(f"Completed {task_name}: {response.output_tokens} tokens")

        logger.info(
            f"Batch analysis complete: {len(tasks)} tasks, "
            f"${total_cost:.4f}"
        )

        return {
            "results": results,
            "metadata": {
                "total_input_tokens": total_input,
                "total_output_tokens": total_output,
                "total_cost": total_cost,
                "model": model_name,
                "provider": llm_provider.provider_name,
            },
        }
