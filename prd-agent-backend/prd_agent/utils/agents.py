import google.auth.transport.requests
import google.oauth2.id_token
from django.conf import settings


def get_cloud_run_id_token():
    """Fetches ID token for authenticated Cloud Run requests"""
    audience = settings.AI_SERVICE_URL.rstrip("/")

    auth_request = google.auth.transport.requests.Request()

    return google.oauth2.id_token.fetch_id_token(auth_request, audience)
