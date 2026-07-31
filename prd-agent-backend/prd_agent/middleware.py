# pylint: disable=W0718
import requests
from django.conf import settings
from django.http import JsonResponse


class CountryFilterMiddleware:
    """
    Simple middleware to filter requests by country.
    Only allows requests from specific countries.
    """

    def __init__(self, get_response):
        self.get_response = get_response
        # Allowed countries
        self.allowed_countries = settings.ALLOWED_COUNTRIES

    def __call__(self, request):
        # If we're in DEBUG mode, don't filter
        if settings.DEBUG:
            return self.get_response(request)

        # Get client IP
        ip = self.get_client_ip(request)

        # If it's a local IP, allow it
        if self.is_local_ip(ip):
            return self.get_response(request)

        # Get country from IP
        country = self.get_country(ip)

        # If country is not allowed, block it
        if country and country not in self.allowed_countries:
            return JsonResponse(
                {"error": "Access denied from your location"}, status=403
            )

        return self.get_response(request)

    def get_client_ip(self, request):
        """Get the real client IP address"""
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0].strip()
        else:
            ip = request.META.get("REMOTE_ADDR")
        return ip

    def is_local_ip(self, ip):
        """Check if it's a local IP address"""
        if not ip:
            return True
        return ip.startswith(("127.", "192.168.", "10.", "localhost"))

    def get_country(self, ip):
        """Get country code for an IP address"""
        try:
            response = requests.get(f"https://ipapi.co/{ip}/country/", timeout=3)
            if response.status_code == 200:
                return response.text.strip().upper()
        except Exception:
            pass  # If it fails, allow access
        return None
