# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

""" Coordinator agent for routing requests to PRD and Quote agents."""

import os

from google.adk.agents import Agent, SequentialAgent
from google.adk.agents.callback_context import CallbackContext
from google.adk.runners import Runner

from . import prompt
from .sub_agents.markdown_generator import markdown_generator
from .sub_agents.prd import prd_agent
from .sub_agents.quote import quoting_agent


def reroute_to_markdown_generator(callback_context: CallbackContext):
    last_user_event = callback_context._invocation_context.session.events[-1]
    last_part = last_user_event.content.parts[-1]

    if hasattr(last_part, "text"):
        last_user_message = last_part.text.strip()
    else:
        last_user_message = None

    print("Last user message detected: ", last_user_message)

    # Only if we get ".generate_markdown", we force it to use the markdown agent
    # This is because prd_agent will always try to generate the markdown. This way we force
    # the autoflow to set the markdown agent for specifically generating the markdown.
    if last_user_message == ".generate_markdown":
        # A runner basically does the request, it can do it sync or async. In this case
        # we pass the invocation context attributes (the new message sent by the user)
        # to the runner. This will allow it to retain the session state info and the input.
        runner = Runner(
            agent=markdown_generator,
            app_name=callback_context._invocation_context.app_name,
            session_service=callback_context._invocation_context.session_service,
        )

        # Run synchronously (or async as appropriate) and capture final output, events
        # is a Generator.
        events = runner.run(
            user_id=callback_context._invocation_context.user_id,
            session_id=callback_context._invocation_context.session.id,
            new_message=callback_context._invocation_context.user_content,
        )

        for event in events:
            if event.is_final_response():
                return event.content

    # Default behavior, it reroutes to the agents as normal
    return None


# Main entry Agent, this will leverage to the rest of agents.
coordinator_agent = Agent(
    model=os.environ.get("MODEL", "gemini-2.5-pro"),
    name="coordinator",
    # description=(
    #     "The Leanware Coordinator silently analyzes user requests and routes them to either the PRD Agent (for requirements documentation), the Quote Agent (for cost estimation) or Markdown Generator Agent (to generate markdown) based on pattern matching and keyword analysis, without any direct user interaction."
    # ),
    description=prompt.COORDINADOR_DESCRIPTION,
    global_instruction=prompt.GLOBAL_INSTRUCTION_PROMPT,
    instruction=prompt.COORDINATOR_PROMPT,
    sub_agents=[prd_agent, quoting_agent],
)

# Non LLM agent.
root_agent = SequentialAgent(
    name="main_sequential_agent",
    before_agent_callback=reroute_to_markdown_generator,
    sub_agents=[coordinator_agent],
)
