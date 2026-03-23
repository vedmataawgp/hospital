from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_patient', 'get_doctor', 'date', 'time', 'status', 'created_at')
    list_filter = ('status', 'date')
    search_fields = ('patient__user__name', 'doctor__user__name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    list_editable = ('status',)

    def get_patient(self, obj):
        return obj.patient.user.name
    get_patient.short_description = 'Patient'

    def get_doctor(self, obj):
        return f'Dr. {obj.doctor.user.name}'
    get_doctor.short_description = 'Doctor'
