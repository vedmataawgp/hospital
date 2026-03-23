from django.db import models
from apps.accounts.models import User


class Notification(models.Model):
    TYPE_CHOICES = [
        ('appointment', 'Appointment'),
        ('billing', 'Billing'),
        ('report', 'Report'),
        ('system', 'System'),
    ]
    STATUS_CHOICES = [('read', 'Read'), ('unread', 'Unread')]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', db_index=True)
    message = models.TextField()
    type = models.CharField(max_length=15, choices=TYPE_CHOICES, default='system')
    status = models.CharField(max_length=6, choices=STATUS_CHOICES, default='unread')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.type}] {self.message[:50]}'
