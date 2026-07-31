"""
This module defines the Django REST Framework views for the user module.
"""
# pylint: disable=W0613,W0718,R0914
import base64
import io

from django.conf import settings
from django.db import connection
from rest_framework import status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.chats.models import Quote, Session
from prd_agent.utils.gcs import upload_to_gcs
from prd_agent.utils.sendgrid import send_email
from prd_agent.utils.slack import send_slack_message


class DownloadView(views.APIView):
    """View for handling PDF downloads."""

    permission_classes = [IsAuthenticated]

    def post(self, request, session_key):
        """Process a PDF download request."""
        user = request.user
        data = request.data
        print("****************", data)
        if not user.downloaded:
            session = Session.objects.filter(user=user, session_key=session_key).first()
            if not session:
                return Response(
                    {"message": "No session found"}, status=status.HTTP_404_NOT_FOUND
                )
            pdf_content = base64.b64decode(data["base_64_pdf"])
            file_info = upload_to_gcs(
                pdf_content,
                session_key,
            )
            pdf_bytes = io.BytesIO()
            pdf_bytes.write(pdf_content)
            pdf_bytes.seek(0)
            hyperlink = (
                f"<https://storage.cloud.google.com/{settings.PRD_BUCKET}/"
                f"{file_info.get('filename')}|this PRD>"
            )

            with open("api/prd_agent/templates/quote.html", "rb") as file:
                html_template = file.read()
                html_template_str = html_template.decode("utf-8")
                html_content = html_template_str.replace("{{name}}", user.name)
                send_email(
                    to_email=user.email,
                    subject="Your Custom Project Quote from Leanware",
                    html_content=html_content,
                    attachments=[
                        {
                            "content": pdf_bytes.getvalue(),
                            "filename": file_info.get("filename"),
                            "type": "application/pdf",
                        }
                    ],
                )

            if data["quote"]:
                send_slack_message(
                    f"{str(user)} wants a quote from Leanware on what is described in {hyperlink}."
                )
            else:
                send_slack_message(f"{str(user)} created {hyperlink}.")

            Quote.objects.create(session=session, quote_pdf_path=file_info["filename"])
            user.downloaded = True
            user.save()

            return Response({"presigned_url": file_info["presigned_url"]})

        return Response(
            {"message": "The user already downloaded a PRD file"},
            status=status.HTTP_403_FORBIDDEN,
        )


class ScheduleCallView(views.APIView):
    """
    View for handling call scheduling requests.

    This endpoint:
    1. Validates the request data and session
    2. Decodes the base64 PDF content
    3. Uploads the PDF to Google Cloud Storage
    4. Emails the PDF and user information to the team
    """

    def post(self, request, session_key):
        """
        Process a call scheduling request, store the PDF in GCS, and email it to the team.

        Expected request data:
        - base_64_pdf: Base64 encoded PDF content
        - name: User's name
        - email: User's email
        - message: User's message

        """
        data = request.data
        user = request.user

        # Validate request data
        if not data:
            return Response(
                {"error": "No data provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        required_fields = ["base_64_pdf", "name", "email", "message"]
        for field in required_fields:
            if field not in data or not data[field]:
                return Response(
                    {"error": f"Missing required field: {field}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        session = Session.objects.filter(user=user, session_key=session_key).first()
        if not session:
            return Response(
                {"message": "No session found"}, status=status.HTTP_404_NOT_FOUND
            )

        try:
            pdf_content = base64.b64decode(data["base_64_pdf"])
            file_info = upload_to_gcs(
                pdf_content,
                session_key,
            )
            pdf_bytes = io.BytesIO()
            pdf_bytes.write(pdf_content)
            pdf_bytes.seek(0)

            with open("api/prd_agent/templates/schedule.html", "rb") as file:
                html_template = file.read()
                html_template_str = html_template.decode("utf-8")
                html_content = html_template_str.replace("{{name}}", data["name"])
                html_content = html_content.replace("{{email}}", data["email"])
                html_content = html_content.replace("{{message}}", data["message"])
                send_email(
                    to_email=settings.TEAM_EMAIL,
                    subject=f"{data['email']} has asked for a call about its requirements",
                    html_content=html_content,
                    attachments=[
                        {
                            "content": pdf_bytes.getvalue(),
                            "filename": file_info.get("filename"),
                            "type": "application/pdf",
                        }
                    ],
                )
            return Response({"sent": True}, status=status.HTTP_200_OK)
        except base64.binascii.Error:
            return Response(
                {"error": "Invalid base64 PDF content"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class HealthCheckView(views.APIView):
    """
    View for handling health checks.
    """

    def get(self, request):
        try:
            connection.cursor()
            return Response({"status": "ok"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
