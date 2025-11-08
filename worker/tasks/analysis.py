"""Analysis tasks for background transcript processing."""

import sys
from pathlib import Path
from typing import Dict, Any, List
from decimal import Decimal
import asyncio
import sentry_sdk

# Add API path for shared imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "api"))

from app.services.llm import LLMProviderFactory
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


def analyze_transcript_task(
    transcript: str,
    provider: str,
    model: str,
    system_prompt: str,
    tasks: Dict[str, str],
) -> Dict[str, Any]:
    """Background task: Analyze a transcript with multiple tasks.

    This is a synchronous wrapper around async LLM calls for RQ compatibility.

    Args:
        transcript: Raw transcript text
        provider: LLM provider name ('gemini', 'openai', 'anthropic')
        model: Model identifier
        system_prompt: System/context prompt
        tasks: Dictionary of {task_name: task_prompt}

    Returns:
        Dictionary with results and metadata

    Example:
        {
            "results": {
                "summary": "Meeting discussed...",
                "key_decisions": ["Decision 1"],
            },
            "metadata": {
                "provider": "gemini",
                "model": "gemini-2.5-flash",
                "input_tokens": 1234,
                "output_tokens": 567,
                "total_cost": 0.0123
            }
        }
    """
    logger.info(f"Starting analysis task: {provider}/{model}")
    logger.debug(f"Tasks: {list(tasks.keys())}")

    # Add Sentry context
    with sentry_sdk.push_scope() as scope:
        scope.set_tag("job_type", "transcript_analysis")
        scope.set_tag("llm_provider", provider)
        scope.set_tag("llm_model", model)
        scope.set_context("job", {
            "provider": provider,
            "model": model,
            "task_count": len(tasks),
            "task_names": list(tasks.keys()),
        })

        # Run async analysis in sync context
        return asyncio.run(_analyze_async(
            transcript=transcript,
            provider=provider,
            model=model,
            system_prompt=system_prompt,
            tasks=tasks,
        ))


async def _analyze_async(
    transcript: str,
    provider: str,
    model: str,
    system_prompt: str,
    tasks: Dict[str, str],
) -> Dict[str, Any]:
    """Internal async function to perform analysis."""

    # Create LLM provider
    llm_provider = LLMProviderFactory.create(provider=provider, model=model)

    # Track metrics
    total_input_tokens = 0
    total_output_tokens = 0
    total_cost = Decimal("0.00")

    # Execute each task
    results = {}
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
            temperature=0.7,
        )

        # Store result
        results[task_name] = response.content

        # Accumulate metrics
        total_input_tokens += response.input_tokens
        total_output_tokens += response.output_tokens
        if response.cost:
            total_cost += Decimal(str(response.cost))

        logger.debug(f"Completed {task_name}: {response.output_tokens} tokens")

    logger.info(f"Analysis complete: ${float(total_cost):.4f}")

    return {
        "results": results,
        "metadata": {
            "provider": llm_provider.provider_name,
            "model": response.model,
            "input_tokens": total_input_tokens,
            "output_tokens": total_output_tokens,
            "total_tokens": total_input_tokens + total_output_tokens,
            "total_cost": float(total_cost),
        },
    }


def analyze_batch_task(
    transcript: str,
    provider: str,
    model: str,
    tasks: List[Dict[str, str]],
) -> Dict[str, Any]:
    """Background task: Analyze a transcript with multiple prompts (batch).

    Args:
        transcript: Raw transcript text
        provider: LLM provider name
        model: Model identifier
        tasks: List of {task_name: str, prompt: str} dictionaries

    Returns:
        Dictionary with results array and totals

    Example:
        {
            "results": [
                {"task_name": "Summary", "result": "...", "tokens": 123, "cost": 0.01},
                ...
            ],
            "metadata": {
                "total_input_tokens": 5000,
                "total_output_tokens": 1000,
                "total_cost": 0.05,
                "model": "gemini-2.5-flash"
            }
        }
    """
    logger.info(f"Starting batch analysis: {len(tasks)} tasks")

    # Add Sentry context
    with sentry_sdk.push_scope() as scope:
        scope.set_tag("job_type", "batch_analysis")
        scope.set_tag("llm_provider", provider)
        scope.set_tag("llm_model", model)
        scope.set_context("job", {
            "provider": provider,
            "model": model,
            "batch_size": len(tasks),
        })

        # Run async analysis in sync context
        return asyncio.run(_analyze_batch_async(
            transcript=transcript,
            provider=provider,
            model=model,
            tasks=tasks,
        ))


async def _analyze_batch_async(
    transcript: str,
    provider: str,
    model: str,
    tasks: List[Dict[str, str]],
) -> Dict[str, Any]:
    """Internal async function for batch analysis."""

    # Create LLM provider
    llm_provider = LLMProviderFactory.create(provider=provider, model=model)

    results = []
    total_input = 0
    total_output = 0
    total_cost = 0.0

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
            system_prompt="You are an expert at analyzing transcripts.",
            temperature=0.7,
        )

        # Accumulate totals
        total_input += response.input_tokens
        total_output += response.output_tokens
        total_cost += response.cost or 0.0

        results.append({
            "task_name": task_name,
            "result": response.content,
            "input_tokens": response.input_tokens,
            "output_tokens": response.output_tokens,
            "cost": response.cost or 0.0,
        })

        logger.debug(f"Completed {task_name}: {response.output_tokens} tokens")

    logger.info(f"Batch complete: {len(tasks)} tasks, ${total_cost:.4f}")

    return {
        "results": results,
        "metadata": {
            "total_input_tokens": total_input,
            "total_output_tokens": total_output,
            "total_cost": total_cost,
            "model": model,
            "provider": provider,
        },
    }
