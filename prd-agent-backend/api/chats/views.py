"""
This module defines views for chat-related functionality.
"""
# pylint: disable=W0718

import traceback

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from api.chats.models import Session
from api.chats.serializers import ChatMessageSerializer
from api.chats.utils.langchain_utils import send_message
from api.chats.utils.session import create_session
from prd_agent.utils.tools import pdf_tool_func

MAX_FILE_SIZE = 20 * 1024 * 1024


class CreateSessionAPIView(APIView):
    def post(self, request):
        session = create_session(request.user)
        if not session:
            return Response(
                {"error": "Failed to create session"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({"session_key": session.session_key}, status=status.HTTP_200_OK)


class ChatAPIView(APIView):
    def post(self, request, session_key):
        # Prepare data for serializer
        data = {
            "message": request.data.get("message"),
            "files": request.FILES.getlist("files"),
        }

        # Validate input data
        serializer = ChatMessageSerializer(data=data)
        if not serializer.is_valid():
            return Response(
                {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )

        validated_data = serializer.validated_data
        message = validated_data["message"]
        files = validated_data.get("files", [])
        if not message and not files:
            return Response(
                {"error": "At least one of message or files must be provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session = Session.objects.get(user=request.user, session_key=session_key)
        if not session:
            return Response(
                {"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND
            )

        try:
            llm_response = send_message(
                user=request.user,
                user_input=message,
                session_key=session_key,
                check_prd_completion=True,
                files=files,
            )

            response_data = {
                "message": llm_response.get("output"),
                "document_completed": llm_response.get("is_prd_complete"),
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except RuntimeError as e:
            print(traceback.format_exc())
            return Response(
                {"error": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            print(traceback.format_exc())
            return Response(
                {"error": f"Unexpected error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class PdfPreviewAPIView(APIView):
    def post(self, request, session_key):
        try:
            session = Session.objects.get(user=request.user, session_key=session_key)
            if not session:
                return Response(
                    {"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND
                )

            llm_response = send_message(
                user=request.user,
                user_input=".generate_markdown",
                session_key=session_key,
            )
            markdown = llm_response.get("output", "")
            sections = llm_response.get("sections", [])
            pdf_base64 = pdf_tool_func(markdown)
            response = {
                "markdown": markdown,
                "pdf_base64": pdf_base64,
                "sections": sections,
            }
            return Response(response, status=status.HTTP_200_OK)
        except RuntimeError as error:
            print(traceback.format_exc())
            return Response(
                {"error": str(error)}, status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
