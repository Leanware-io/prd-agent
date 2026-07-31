"""PRD agent for generate PRDs."""

import os

from google.adk import Agent

from . import prompt

markdown_generator = Agent(
    model=os.environ.get("MODEL", "gemini-2.0-flash"),
    name="markdown_agent",
    description=prompt.PDF_DESCRIPTION,
    instruction=prompt.PDF_PROMPT,
    disallow_transfer_to_parent=True,
    disallow_transfer_to_peers=True,
)
