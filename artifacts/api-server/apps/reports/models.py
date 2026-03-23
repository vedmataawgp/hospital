from django.db import models
from apps.patients.models import Patient


class Report(models.Model):
    TYPE_CHOICES = [
        ('lab', 'Lab'),
        ('radiology', 'Radiology'),
        ('prescription', 'Prescription'),
        ('discharge', 'Discharge'),
        ('other', 'Other'),
    ]
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='reports', db_index=True)
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    file_url = models.URLField(null=True, blank=True)
    report_type = models.CharField(max_length=15, choices=TYPE_CHOICES, default='other')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reports'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} - {self.patient}'
