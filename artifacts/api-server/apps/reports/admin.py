from django.contrib import admin
from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'get_patient', 'report_type', 'created_at')
    list_filter = ('report_type',)
    search_fields = ('title', 'patient__user__name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

    def get_patient(self, obj):
        return obj.patient.user.name
    get_patient.short_description = 'Patient'
