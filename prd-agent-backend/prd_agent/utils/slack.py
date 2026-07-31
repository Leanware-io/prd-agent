"""Slack integration utilities for Django"""
import logging

from django.conf import settings
from slack_sdk.errors import SlackApiError
from slack_sdk.web.client import WebClient

logger = logging.getLogger(__name__)


def get_slack_client():
    """
    Get a Slack client instance using the token from settings

    Returns:
        WebClient: Configured Slack client
    """
    return WebClient(token=settings.SLACK_BOT_TOKEN)


def send_slack_message(message: str) -> bool:
    """
    Send a message to Slack using the Slack SDK.

    Args:
        message (str): The message to send
    Returns:
        bool: True if successful, False otherwise
    """
    if not message:
        logger.error("Cannot send message to Slack: message or channel ID is missing")
        return False

    try:
        client = get_slack_client()
        response = client.chat_postMessage(
            channel=settings.SLACK_CHANNEL_ID, text=message
        )
        if response.status_code != 200:
            logger.error("Error sending message to Slack")
            return False
        return True
    except SlackApiError as error:
        logger.error("Error sending message to Slack: %s", {error})
        return False
