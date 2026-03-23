from django.db import models
from apps.accounts.models import User


class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    specialization = models.CharField(max_length=255, default='General', db_index=True)
    experience = models.IntegerField(default=0)
    phone = models.CharField(max_length=20, null=True, blank=True)
    availability = models.TextField(null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'doctors'
        ordering = ['-created_at']

    def __str__(self):
        return f'Dr. {self.user.name} - {self.specialization}'
