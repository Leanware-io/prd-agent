"""
This module contains the langchain utilities to have a
conversation with a LLM and generate a PRD.
"""
# pylint: disable=W0707,W0719

import base64
import json
import re
from typing import List

import requests
from django.conf import settings
from werkzeug.datastructures import FileStorage

from api.users.models import User
from prd_agent.utils.agents import get_cloud_run_id_token
from prd_agent.utils.slack import send_slack_message


def parse_json_from_various_formats(data):
    """
    Parse JSON data from various formats including:
    - Already parsed dict/object
    - JSON string
    - JSON wrapped in markdown code blocks

    Args:
        data: The data to parse (dict, str, or other)

    Returns:
        dict: Parsed JSON data, or empty dict if parsing fails
    """
    if isinstance(data, dict):
        return data

    if isinstance(data, str):
        try:
            return json.loads(data)
        except json.JSONDecodeError:
            pass

        json_pattern = r"```(?:json)?\s*\n?((?:[^`]|`(?!``))*?)\n?```"
        matches = re.findall(json_pattern, data, re.DOTALL | re.IGNORECASE)

        for match in matches:
            try:
                return json.loads(match.strip())
            except json.JSONDecodeError:
                continue

        try:
            return json.loads(data.strip())
        except json.JSONDecodeError:
            pass

    return {}


def extract_prd_agent_info(data_response):
    """
    Extract output from entries where author is "prd_agent" or "quoting_agent".
    Returns is_prd_complete for "prd_agent" entries only.
    If no such entries exist, return empty string and False.

    This function parses the structured output format from the PRD or quoting agent to extract:
    1. The content text
    2. A flag indicating whether the PRD is complete (only for prd_agent)

    Args:
        data_response (list): List of conversation entries from the AI service

    Returns:
        dict: Contains:
            - output (str): The content text or empty string if not found
            - is_prd_complete (bool): True if the PRD is marked as complete, False otherwise
              (only included for prd_agent responses)
    """
    response = {"output": ""}
    if not data_response or not isinstance(data_response, list):
        return response

    for item in data_response:
        state_delta = item.get("actions", {}).get("state_delta", {})
        if item.get("author") == "prd_agent":
            results_raw = state_delta.get("results_prd_agent", {})
            results = parse_json_from_various_formats(results_raw)
            output = results.get("output", "")
            is_prd_complete = results.get("is_prd_complete", False)
            response["author"] = "prd_agent"
            response["output"] = output
            response["is_prd_complete"] = is_prd_complete
        if item.get("author") == "quoting_agent":
            results_raw = state_delta.get("results_quoting_agent", {})
            results = parse_json_from_various_formats(results_raw)
            output = results.get("output", "")
            response["author"] = "quoting_agent"
            response["output"] = output
            response["is_prd_complete"] = True
        if item.get("author") in ("markdown_agent", "main_sequential_agent"):
            results_raw = state_delta.get("results_markdown_agent", {})
            results = parse_json_from_various_formats(results_raw)
            output = results.get("output", "")
            sections = results.get("sections", [])
            response["author"] = "markdown_agent"
            response["output"] = output
            response["sections"] = sections
    return response


def send_message(
    user: User,
    user_input: str,
    session_key: str,
    check_prd_completion: bool = False,
    files: List[FileStorage] = None,
):
    """
    Processes a user message and optional files through the AI service and formats the response.

    This function:
    1. Validates the input parameters
    2. Sends the request to the AI service via send_request_to_ai
    3. Parses the response, attempting to extract JSON data
    4. Returns both the response text and PRD completion status if requested

    Args:
        user_input (str): The message from the user
        session_key (str): Unique identifier for the chat session
        check_prd_completion (bool, optional): Whether to check if PRD is complete
        files (List[FileStorage], optional): List of uploaded files to process with the message

    Returns:
        dict: Contains:
            - 'output': The formatted text response from the AI
            - 'is_prd_complete': Boolean indicating PRD completion status

    Raises:
        ValueError: If input parameters are invalid or empty
        RuntimeError: If there's an error with the LLM service or response format
        Exception: For other unexpected errors
    """
    data_response = send_request_to_ai(user, session_key, user_input, files)
    if not data_response or not isinstance(data_response, list):
        raise RuntimeError("Invalid response from LLM.")
    result = extract_prd_agent_info(data_response)
    output = result.get("output", "")
    is_prd_complete = result.get("is_prd_complete", False)
    author = result.get("author", "")
    if output != "" and author in ("prd_agent", "quoting_agent"):
        return {
            "output": output,
            "is_prd_complete": is_prd_complete,
        }
    if output != "" and author == "markdown_agent":
        return {
            "output": output,
            "sections": result.get("sections", []),
        }
    text_response = data_response[-1]
    return {
        "output": text_response["content"]["parts"][-1]["text"],
        "is_prd_complete": (
            text_response.get("is_prd_complete", False)
            if check_prd_completion
            else False
        ),
    }


def send_request_to_ai(
    user: User,
    session_key: str,
    user_input: str,
    files: List[FileStorage] = None,
):
    """
    Sends a request to the AI service with user input and optional file attachments.

    This function:
    1. Formats the user message and any uploaded files for the AI service
    2. Makes an HTTP request to the configured AI service endpoint
    3. Validates and returns the response from the service

    Args:
        session_key (str): Unique identifier for the chat session
        user_input (str): The message from the user
        files (List[FileStorage], optional): List of uploaded files to process with the message.

    Returns:
        list: The raw response data from the AI service

    Raises:
        ValueError: If input parameters are invalid or the service rejects the request
        RuntimeError: If there's an error with the LLM service or response format
        requests.exceptions.RequestException: For network/connectivity issues
    """
    try:
        parts = []
        if isinstance(files, List):
            for file in files:
                file_bytes = file.read()
                file.seek(0)
                b64_data = base64.b64encode(file_bytes).decode("utf-8")
                parts.append(
                    {
                        "inline_data": {
                            "data": b64_data,
                            "mime_type": file.mimetype,
                        }
                    }
                )
        if user_input:
            parts.append({"text": user_input})
        response = requests.post(
            settings.AI_SERVICE_URL + "/run",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {get_cloud_run_id_token()}",
            },
            json={
                "app_name": settings.AI_APP_NAME,
                "user_id": user.email,
                "session_id": session_key,
                "new_message": {"role": "user", "parts": parts},
            },
            timeout=60,
        )

        if response.status_code == 429:
            send_slack_message(
                """
                LLM service has returned 429 (Too many requests) - it
                may be due to resource exhaustion as we use pay-as-you-go in the selected region.
                """
            )
            raise RuntimeError(
                """
                The AI service is unavailable as too many requests
                have been sent, please try again later.
                """
            )

        if response.status_code == 422:
            raise ValueError("Bad parameters sent to the LLM.")

        if response.status_code >= 500:
            raise RuntimeError(
                "An error has occurred in the LLM service. Try again later."
            )

        data = response.json()

        if not data:
            raise RuntimeError("Invalid response from LLM: no data returned.")

        text_response = data[-1]
        if "content" not in text_response or "parts" not in text_response["content"]:
            raise RuntimeError("Invalid response from LLM: no text response.")
        return data
    except requests.exceptions.RequestException as error:
        print(error)
        raise RuntimeError("Connectivity issue to the LLM service.")
