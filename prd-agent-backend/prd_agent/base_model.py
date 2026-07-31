"""Base model for all models"""
# pylint: disable=R0903

import uuid

from django.db import models


class BaseModel(models.Model):
    """
    A base model class that provides common fields for other models to inherit from.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
