""" This module contains exceptions. """

from rest_framework import status
from rest_framework.exceptions import APIException


class NoAuthToken(APIException):
    """Exception raised when no authentication token is provided."""

    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = "No authentication token provided"
    default_code = "no_auth_token"


class InvalidAuthToken(APIException):
    """Exception raised when an invalid authentication token is provided."""

    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = "Invalid authentication token provided"
    default_code = "invalid_token"


class FirebaseError(APIException):
    """Exception raised when an error occurs with Firebase."""

    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = (
        "The user provided with the auth token is not a valid Firebase user"
    )
    default_code = "no_valid_firebase_user"
