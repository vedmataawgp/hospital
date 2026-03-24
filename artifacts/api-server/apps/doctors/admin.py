from django.contrib import admin
from .models import Doctor, DoctorSchedule


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


@admin.register(DoctorSchedule)
class DoctorScheduleAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_doctor', 'day_of_week', 'start_time', 'end_time', 'slot_duration_minutes', 'is_available')
    list_filter = ('day_of_week', 'is_available')
    search_fields = ('doctor__user__name',)
    list_editable = ('is_available',)

    def get_doctor(self, obj):
        return f'Dr. {obj.doctor.user.name}'
    get_doctor.short_description = 'Doctor'
