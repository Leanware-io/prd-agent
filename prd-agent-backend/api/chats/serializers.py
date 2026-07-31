"""
This module defines serializers for chat-related API views.
"""

# pylint: disable=W0223

from rest_framework import serializers


class ChatMessageSerializer(serializers.Serializer):
    """
    Serializer for chat message requests.
    """

    message = serializers.CharField(
        max_length=10000, help_text="The message text to send to the chat"
    )
    files = serializers.ListField(
        child=serializers.FileField(),
        required=False,
        allow_empty=True,
        help_text="Optional list of files to attach to the message",
    )

    def validate_message(self, value):
        """
        Validate that the message is not empty after stripping whitespace.
        """
        if not value or not value.strip():
            raise serializers.ValidationError("Message cannot be empty")
        return value.strip()

    def validate_files(self, value):
        """
        Validate uploaded files size and format.
        """
        max_file_size = 20 * 1024 * 1024  # 20MB

        for file in value:
            if file.size > max_file_size:
                raise serializers.ValidationError(
                    f"File '{file.name}' exceeds the maximum size limit of 20MB"
                )

        return value
