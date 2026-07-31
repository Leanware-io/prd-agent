"""
This module defines URL patterns for user-related views.
"""

from django.urls import path

from api.users.views import DownloadView, HealthCheckView, ScheduleCallView

urlpatterns = [
    path(
        "download/quote/<str:session_key>",
        DownloadView.as_view(),
        name="download_quote",
    ),
    path(
        "schedule-call/<str:session_key>",
        ScheduleCallView.as_view(),
        name="schedule_call",
    ),
    path("health/db", HealthCheckView.as_view(), name="health_db_check"),
]
