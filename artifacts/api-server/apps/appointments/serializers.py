from rest_framework import serializers
from .models import Appointment, Prescription


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


class PrescriptionSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user.name', read_only=True)
    patient_email = serializers.CharField(source='patient.user.email', read_only=True)
    doctor_name = serializers.CharField(source='doctor.user.name', read_only=True)
    doctor_specialization = serializers.CharField(source='doctor.specialization', read_only=True)
    appointment_date = serializers.CharField(source='appointment.date', read_only=True, default=None)

    class Meta:
        model = Prescription
        fields = [
            'id', 'appointment', 'appointment_date',
            'patient', 'patient_name', 'patient_email',
            'doctor', 'doctor_name', 'doctor_specialization',
            'medication', 'dosage', 'frequency', 'duration', 'instructions',
            'created_at',
        ]
