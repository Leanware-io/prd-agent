"""PRD agent for generate PRDs."""

import os

from google.adk import Agent
from pydantic import BaseModel, Field

from . import prompt


class PrdAgentOutput(BaseModel):
    output: str = Field(
        description="Conversational response from the PRD Agent, always in plain text (never markdown). Guides the user or asks for needed information."
    )
    is_prd_complete: bool = Field(
        description="True if the agent considers the Product Requirements Document finished; otherwise, false."
    )


prd_agent = Agent(
    model=os.environ.get("MODEL", "gemini-2.5-pro"),
    name="prd_agent",
    description=prompt.PRD_DESCRIPTION,
    instruction=prompt.PRD_PROMPT,
    output_key="results_prd_agent",
    output_schema=PrdAgentOutput,
)
