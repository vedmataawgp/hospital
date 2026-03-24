from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Appointment
from .serializers import AppointmentSerializer
from apps.patients.models import Patient
from apps.doctors.models import Doctor
from apps.notifications.models import Notification
from core.pagination import StandardResultsSetPagination
from core.permissions import IsAdmin, IsAdminOrDoctor
from django.db.models import Q


def _scoped_qs(request):
    """Return appointments visible to the requesting user based on their role."""
    role = request.user.role
    qs = Appointment.objects.select_related('patient__user', 'doctor__user')

    if role == 'admin':
        qs = qs.all()
    elif role == 'doctor':
        try:
            doctor = Doctor.objects.get(user=request.user)
            qs = qs.filter(doctor=doctor)
        except Doctor.DoesNotExist:
            return qs.none()
    elif role == 'patient':
        try:
            patient = Patient.objects.get(user=request.user)
            qs = qs.filter(patient=patient)
        except Patient.DoesNotExist:
            return qs.none()
    else:
        return qs.none()

    status = request.query_params.get('status')
    doctor_id = request.query_params.get('doctorId')
    patient_id = request.query_params.get('patientId')
    if status:
        qs = qs.filter(status=status)
    if doctor_id and role == 'admin':
        qs = qs.filter(doctor_id=doctor_id)
    if patient_id and role in ('admin', 'doctor'):
        qs = qs.filter(patient_id=patient_id)
    return qs


def _can_access_appointment(user, appt):
    """Return True if user is the patient, the doctor, or an admin."""
    if user.role == 'admin':
        return True
    if user.role == 'doctor':
        return hasattr(user, 'doctor_profile') and user.doctor_profile == appt.doctor
    if user.role == 'patient':
        return hasattr(user, 'patient_profile') and user.patient_profile == appt.patient
    return False


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def appointment_list(request):
    if request.method == 'GET':
        qs = _scoped_qs(request)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(AppointmentSerializer(page, many=True).data)

    data = request.data
    doctor_id = data.get('doctorId')
    patient_id = data.get('patientId')
    date = data.get('date')
    time = data.get('time')
    notes = data.get('notes', '')

    if not doctor_id or not date or not time:
        return Response({'error': 'Bad Request', 'message': 'doctorId, date, time required'}, status=400)

    if not patient_id and request.user.role == 'patient':
        try:
            patient_id = request.user.patient_profile.id
        except Patient.DoesNotExist:
            return Response({'error': 'Bad Request', 'message': 'Patient profile not found'}, status=400)

    if not patient_id:
        return Response({'error': 'Bad Request', 'message': 'patientId required'}, status=400)

    if request.user.role == 'patient':
        try:
            own_patient = Patient.objects.get(user=request.user)
            if str(own_patient.id) != str(patient_id):
                return Response({'error': 'Forbidden', 'message': 'You can only book appointments for yourself.'}, status=403)
        except Patient.DoesNotExist:
            return Response({'error': 'Bad Request', 'message': 'Patient profile not found'}, status=400)

    try:
        patient = Patient.objects.get(pk=patient_id)
        doctor = Doctor.objects.get(pk=doctor_id)
    except (Patient.DoesNotExist, Doctor.DoesNotExist) as e:
        return Response({'error': 'Not Found', 'message': str(e)}, status=404)

    appt = Appointment.objects.create(
        patient=patient, doctor=doctor, date=date, time=time, notes=notes
    )
    Notification.objects.create(
        user=patient.user,
        message=f'Your appointment has been booked for {date} at {time}',
        type='appointment',
    )
    return Response(AppointmentSerializer(appt).data, status=201)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def appointment_detail(request, pk):
    try:
        appt = Appointment.objects.select_related('patient__user', 'doctor__user').get(pk=pk)
    except Appointment.DoesNotExist:
        return Response({'error': 'Not Found', 'message': 'Appointment not found'}, status=404)

    if not _can_access_appointment(request.user, appt):
        return Response({'error': 'Forbidden', 'message': 'You do not have access to this appointment.'}, status=403)

    if request.method == 'GET':
        return Response(AppointmentSerializer(appt).data)

    if request.method == 'PUT':
        if request.user.role not in ('admin', 'doctor'):
            return Response({'error': 'Forbidden', 'message': 'Only admins and doctors can update appointments.'}, status=403)
        for field in ['date', 'time', 'status', 'notes']:
            if field in request.data:
                setattr(appt, field, request.data[field])
        appt.save()
        return Response(AppointmentSerializer(appt).data)

    if request.user.role not in ('admin',):
        return Response({'error': 'Forbidden', 'message': 'Only admins can delete appointments.'}, status=403)
    appt.delete()
    return Response({'message': 'Appointment cancelled'})


@api_view(['POST'])
@permission_classes([IsAdminOrDoctor])
def confirm_appointment(request, pk):
    try:
        appt = Appointment.objects.select_related('patient__user', 'doctor__user').get(pk=pk)
    except Appointment.DoesNotExist:
        return Response({'error': 'Not Found', 'message': 'Appointment not found'}, status=404)

    if request.user.role == 'doctor':
        try:
            if Doctor.objects.get(user=request.user) != appt.doctor:
                return Response({'error': 'Forbidden', 'message': 'You can only confirm your own appointments.'}, status=403)
        except Doctor.DoesNotExist:
            return Response({'error': 'Forbidden'}, status=403)

    appt.status = 'confirmed'
    appt.save()
    Notification.objects.create(
        user=appt.patient.user,
        message=f'Your appointment on {appt.date} at {appt.time} has been confirmed',
        type='appointment',
    )
    return Response(AppointmentSerializer(appt).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_appointment(request, pk):
    try:
        appt = Appointment.objects.select_related('patient__user', 'doctor__user').get(pk=pk)
    except Appointment.DoesNotExist:
        return Response({'error': 'Not Found', 'message': 'Appointment not found'}, status=404)

    if not _can_access_appointment(request.user, appt):
        return Response({'error': 'Forbidden', 'message': 'You do not have access to this appointment.'}, status=403)

    appt.status = 'cancelled'
    appt.save()
    return Response(AppointmentSerializer(appt).data)
