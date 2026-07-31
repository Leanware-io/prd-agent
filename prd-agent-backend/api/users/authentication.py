""" This module contains authentication classes. """

# pylint: disable=W0707,W0212
import os

import firebase_admin
from firebase_admin import auth, credentials
from rest_framework import authentication

from api.users.models import User

from .exceptions import FirebaseError, InvalidAuthToken, NoAuthToken


def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    if not firebase_admin._apps:
        # Check if we have credentials file path
        cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

        if cred_path and os.path.exists(cred_path):
            # Use service account file
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            # Use default credentials (for Cloud Run/GCP environments)
            firebase_admin.initialize_app()


# Initialize Firebase when Django starts
initialize_firebase()


class FirebaseAuthentication(authentication.BaseAuthentication):
    """Firebase authentication"""

    def authenticate(self, request):
        """Authenticate the request"""
        auth_header = request.META.get("HTTP_AUTHORIZATION")
        if not auth_header:
            raise NoAuthToken("No auth token provided")

        token_type, id_token = auth_header.split(" ")
        decoded_token = None

        if token_type != "Bearer":
            raise InvalidAuthToken(f"Token type '{token_type}' is not supported")

        try:
            decoded_token = auth.verify_id_token(id_token)
        except Exception:
            raise InvalidAuthToken("Invalid auth token")

        if not id_token or not decoded_token:
            return None

        try:
            # print("****************", decoded_token)
            uid = decoded_token["uid"]
            email = decoded_token["email"]
            name = decoded_token["name"]
        except Exception:
            raise FirebaseError()

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            user, _ = User.objects.get_or_create(
                firebase_uuid=uid, defaults={"name": name, "email": email}
            )

        return (user, None)
