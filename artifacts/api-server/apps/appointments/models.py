from django.db import models
from apps.patients.models import Patient
from apps.doctors.models import Doctor


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments', db_index=True)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments', db_index=True)
    date = models.CharField(max_length=20)
    time = models.CharField(max_length=10)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'appointments'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.patient} with Dr.{self.doctor} on {self.date}'
