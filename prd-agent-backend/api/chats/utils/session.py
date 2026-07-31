"""
Session management utilities for the PRD Agent application.
"""

from traceback import format_exc

import requests
from django.conf import settings
from django.db import transaction

from api.chats.models import Session
from prd_agent.utils.agents import get_cloud_run_id_token


def create_ai_session(user: str, session_id: str):
    # Initialize session in AI service
    try:
        response = requests.post(
            settings.AI_SERVICE_URL
            + f"/apps/{settings.AI_APP_NAME}/users/{user}/sessions/{session_id}",
            headers={"Authorization": f"Bearer {get_cloud_run_id_token()}"},
            timeout=60,
        )
        if response.status_code >= 400:
            raise RuntimeError("An error has occurred in the LLM service.")
    except Exception:
        print(format_exc())
        raise RuntimeError("An error has occurred in the LLM service.")


@transaction.atomic
def create_session(user):
    """
    Creates a new session in the database.

    Returns:
        Session: The newly created session object.
    """

    session = Session.objects.create(user=user)
    if session:
        create_ai_session(user.email, session.session_key)
    return session
