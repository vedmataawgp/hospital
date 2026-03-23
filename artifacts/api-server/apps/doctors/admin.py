from django.contrib import admin
from .models import Doctor


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('get_name', 'get_email', 'specialization', 'experience', 'phone', 'created_at')
    list_filter = ('specialization',)
    search_fields = ('user__name', 'user__email', 'specialization')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

    def get_name(self, obj):
        return obj.user.name
    get_name.short_description = 'Name'

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'
