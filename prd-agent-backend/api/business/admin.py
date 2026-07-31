from django.contrib import admin

from api.business.models import BusinessModel, Position, Rate


@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ("name", "description")
    search_fields = ("name",)


@admin.register(BusinessModel)
class BusinessModelAdmin(admin.ModelAdmin):
    list_display = ("name", "description")
    search_fields = ("name",)


@admin.register(Rate)
class RateAdmin(admin.ModelAdmin):
    list_display = ("position", "business_model", "rate_per_hour")
    list_filter = ("position", "business_model")
