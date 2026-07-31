"""Quoting agent for generating quotes."""

import os

from google.adk import Agent

from . import prompt

quoting_agent = Agent(
    model=os.environ.get("MODEL", "gemini-2.5-pro"),
    name="quoting_agent",
    description=prompt.QUOTING_DESCRIPTION,
    instruction=prompt.QUOTING_PROMPT,
    output_key="results_quoting_agent",
)
