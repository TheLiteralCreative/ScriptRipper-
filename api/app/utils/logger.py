"""Centralized logging configuration for ScriptRipper."""

import logging
import sys
from typing import Optional


def setup_logger(
    name: str,
    level: Optional[str] = None,
    format_string: Optional[str] = None,
) -> logging.Logger:
    """
    Configure and return a logger instance.

    Args:
        name: Logger name (typically __name__)
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        format_string: Custom format string

    Returns:
        Configured logger instance
    """
    if format_string is None:
        format_string = (
            "%(asctime)s - %(name)s - %(levelname)s - "
            "%(filename)s:%(lineno)d - %(message)s"
        )

    logger = logging.getLogger(name)

    # Set level from environment or default
    if level is None:
        import os

        level = os.getenv("LOG_LEVEL", "INFO").upper()

    logger.setLevel(getattr(logging, level))

    # Create console handler if not already exists
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(getattr(logging, level))
        formatter = logging.Formatter(format_string)
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger
