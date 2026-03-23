from django.contrib import admin
from .models import Patient


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('get_name', 'get_email', 'age', 'gender', 'blood_group', 'phone', 'created_at')
    list_filter = ('gender', 'blood_group')
    search_fields = ('user__name', 'user__email', 'phone')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

    def get_name(self, obj):
        return obj.user.name
    get_name.short_description = 'Name'

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'
