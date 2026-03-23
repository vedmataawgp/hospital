from django.db import models
from apps.patients.models import Patient
from apps.appointments.models import Appointment


class Billing(models.Model):
    STATUS_CHOICES = [('paid', 'Paid'), ('pending', 'Pending'), ('overdue', 'Overdue')]
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('insurance', 'Insurance'),
        ('bank_transfer', 'Bank Transfer'),
    ]
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='billing', db_index=True)
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'billing'
        ordering = ['-created_at']

    def __str__(self):
        return f'Bill #{self.id} - {self.patient} - ${self.amount}'
