"""Utilities for handling transcript metadata, headers, and file naming."""

import re
from typing import Optional
from datetime import datetime

from app.schemas.batch_analyze import TranscriptMetadata


def generate_header(metadata: Optional[TranscriptMetadata]) -> str:
    """Generate a standardized header from metadata.

    Args:
        metadata: Transcript metadata (optional)

    Returns:
        Formatted header string, or empty string if no metadata

    Example:
        ═══════════════════════════════════════
        TRANSCRIPT ANALYSIS
        ═══════════════════════════════════════
        Title:        Weekly Team Sync
        Date:         2024-11-18
        Type:         Group Discussion
        Participants: Alice, Bob, Carol
        ───────────────────────────────────────
    """
    if not metadata:
        return ""

    # Build header components
    header_lines = [
        "═" * 60,
        "TRANSCRIPT ANALYSIS",
        "═" * 60,
    ]

    # Title (or "Untitled" if empty)
    title = metadata.title.strip() if metadata.title else "Untitled"
    header_lines.append(f"Title:        {title}")

    # Date (formatted)
    try:
        date_obj = datetime.fromisoformat(metadata.date)
        formatted_date = date_obj.strftime("%B %d, %Y")
    except:
        formatted_date = metadata.date
    header_lines.append(f"Date:         {formatted_date}")

    # Type
    type_label = format_participant_type(metadata.participantType, metadata.customType)
    header_lines.append(f"Type:         {type_label}")

    # Participants (non-empty ones only)
    participants = [p.strip() for p in metadata.participants if p and p.strip()]
    if participants:
        participant_str = ", ".join(participants)
        header_lines.append(f"Participants: {participant_str}")
    else:
        participant_str = f"{metadata.participantCount} participant(s)"
        header_lines.append(f"Participants: {participant_str}")

    # Footer
    header_lines.append("─" * 60)
    header_lines.append("")  # Extra newline for spacing

    return "\n".join(header_lines)


def format_participant_type(participant_type: str, custom_type: Optional[str] = None) -> str:
    """Format participant type for display.

    Args:
        participant_type: Type ('solo', 'interview', 'group', 'panel', 'other')
        custom_type: Custom type if participant_type is 'other'

    Returns:
        Human-readable type string
    """
    if participant_type == "other" and custom_type:
        return custom_type.strip()

    type_map = {
        "solo": "Solo Presentation",
        "interview": "Interview",
        "group": "Group Discussion",
        "panel": "Panel Discussion",
    }

    return type_map.get(participant_type, participant_type.capitalize())


def sanitize_filename(text: str, max_length: int = 50) -> str:
    """Sanitize text for use in filenames.

    Args:
        text: Text to sanitize
        max_length: Maximum length of filename component

    Returns:
        Sanitized filename component

    Example:
        "Weekly Team Sync!" -> "Weekly-Team-Sync"
        "Q4 Planning (Final)" -> "Q4-Planning-Final"
    """
    if not text or not text.strip():
        return "Untitled"

    # Replace spaces with hyphens
    sanitized = text.strip().replace(" ", "-")

    # Remove special characters (keep only alphanumeric, hyphens, underscores)
    sanitized = re.sub(r'[^a-zA-Z0-9\-_]', '', sanitized)

    # Remove consecutive hyphens
    sanitized = re.sub(r'-+', '-', sanitized)

    # Remove leading/trailing hyphens
    sanitized = sanitized.strip('-')

    # Truncate to max length
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length].rstrip('-')

    return sanitized or "Untitled"


def generate_filename(
    metadata: Optional[TranscriptMetadata],
    task_name: str,
    extension: str = "md"
) -> str:
    """Generate a smart filename based on metadata and task.

    Args:
        metadata: Transcript metadata (optional)
        task_name: Name of the analysis task
        extension: File extension (default: 'md')

    Returns:
        Formatted filename

    Example:
        With metadata:
            "2024-11-18_Weekly-Team-Sync_Summary.md"

        Without metadata:
            "Transcript_Summary.md"

        Without title:
            "2024-11-18_Transcript_Summary.md"
    """
    parts = []

    # Date (if available)
    if metadata and metadata.date:
        try:
            date_obj = datetime.fromisoformat(metadata.date)
            parts.append(date_obj.strftime("%Y-%m-%d"))
        except:
            pass

    # Title (if available)
    if metadata and metadata.title and metadata.title.strip():
        parts.append(sanitize_filename(metadata.title))
    else:
        parts.append("Transcript")

    # Task name
    parts.append(sanitize_filename(task_name))

    # Join with underscores
    filename = "_".join(parts)

    # Add extension
    if not extension.startswith('.'):
        extension = f".{extension}"

    return f"{filename}{extension}"


def generate_zip_filename(metadata: Optional[TranscriptMetadata]) -> str:
    """Generate filename for the zip archive.

    Args:
        metadata: Transcript metadata (optional)

    Returns:
        Formatted zip filename

    Example:
        "2024-11-18_Weekly-Team-Sync_Complete.zip"
        "Transcript_Analysis_Complete.zip"
    """
    parts = []

    # Date (if available)
    if metadata and metadata.date:
        try:
            date_obj = datetime.fromisoformat(metadata.date)
            parts.append(date_obj.strftime("%Y-%m-%d"))
        except:
            pass

    # Title (if available)
    if metadata and metadata.title and metadata.title.strip():
        parts.append(sanitize_filename(metadata.title))
    else:
        parts.append("Transcript-Analysis")

    # Add "Complete" suffix
    parts.append("Complete")

    # Join with underscores
    filename = "_".join(parts)

    return f"{filename}.zip"
