from django.contrib import admin
from .models import Billing


@admin.register(Billing)
class BillingAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_patient', 'amount', 'status', 'payment_method', 'paid_at', 'created_at')
    list_filter = ('status', 'payment_method')
    search_fields = ('patient__user__name',)
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'paid_at')
    list_editable = ('status',)

    def get_patient(self, obj):
        return obj.patient.user.name
    get_patient.short_description = 'Patient'
