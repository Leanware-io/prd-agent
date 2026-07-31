from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group
from django.utils.translation import gettext_lazy as _

from api.users.models import User


class UserAdmin(BaseUserAdmin):
    list_display = ("email", "name", "is_staff", "downloaded")
    list_filter = ("is_staff", "is_superuser", "is_active", "downloaded")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Personal info"), {"fields": ("name", "firebase_uuid", "prd_path")}),
        (
            _("Permissions"),
            {
                "fields": ("is_active", "is_staff", "is_superuser", "downloaded"),
            },
        ),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "name", "password1", "password2"),
            },
        ),
    )
    search_fields = ("email", "name")
    ordering = ("email",)
    filter_horizontal = ()


# Register the custom User model
admin.site.register(User, UserAdmin)

# Unregister the Group model
admin.site.unregister(Group)
