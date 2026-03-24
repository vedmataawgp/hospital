from django.db import models
from apps.accounts.models import User


DAYS_OF_WEEK = [
    (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'),
    (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday'),
]


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


class DoctorSchedule(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.IntegerField(choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot_duration_minutes = models.IntegerField(default=30)
    is_available = models.BooleanField(default=True)

    class Meta:
        db_table = 'doctor_schedules'
        unique_together = ('doctor', 'day_of_week')
        ordering = ['day_of_week', 'start_time']

    def __str__(self):
        return f'Dr. {self.doctor.user.name} - {self.get_day_of_week_display()} {self.start_time}-{self.end_time}'

    def generate_slots(self):
        import datetime
        slots = []
        current = datetime.datetime.combine(datetime.date.today(), self.start_time)
        end = datetime.datetime.combine(datetime.date.today(), self.end_time)
        delta = datetime.timedelta(minutes=self.slot_duration_minutes)
        while current < end:
            slots.append(current.strftime('%I:%M %p'))
            current += delta
        return slots
