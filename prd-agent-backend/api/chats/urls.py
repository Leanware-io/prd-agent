"""
This module defines URL patterns for chat-related views.
"""

from django.urls import path

from api.chats.views import ChatAPIView, CreateSessionAPIView  # AudioChatAPIView,

urlpatterns = [
    path("session", CreateSessionAPIView.as_view(), name="create_session"),
    path("chat/<str:session_key>", ChatAPIView.as_view(), name="chat_api"),
    # path('chat/audio/<str:session_key>', AudioChatAPIView.as_view(), name='audio_chat_api'),
]
