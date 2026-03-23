from rest_framework import serializers
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    patientId = serializers.IntegerField(source='patient.id', read_only=True)
    doctorId = serializers.IntegerField(source='doctor.id', read_only=True)
    patientName = serializers.CharField(source='patient.user.name', read_only=True)
    doctorName = serializers.CharField(source='doctor.user.name', read_only=True)
    doctorSpecialization = serializers.CharField(source='doctor.specialization', read_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'patientId', 'doctorId', 'patientName', 'doctorName',
                  'doctorSpecialization', 'date', 'time', 'status', 'notes', 'created_at']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['createdAt'] = ret.pop('created_at', None)
        return ret
