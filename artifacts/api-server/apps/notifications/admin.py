from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_user', 'type', 'status', 'message', 'created_at')
    list_filter = ('type', 'status')
    search_fields = ('user__name', 'message')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

    def get_user(self, obj):
        return obj.user.name
    get_user.short_description = 'User'
