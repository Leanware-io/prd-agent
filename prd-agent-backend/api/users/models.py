from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, name=None, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password=password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    A user is a user of the application. These are created via the Firebase Auth API.
    """

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    firebase_uuid = models.CharField(max_length=255, unique=True, null=True, blank=True)
    downloaded = models.BooleanField(default=False)

    # Fields required by Django Admin
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return str(self.email)
