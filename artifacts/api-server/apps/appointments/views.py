from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Appointment
from .serializers import AppointmentSerializer
from apps.patients.models import Patient
from apps.doctors.models import Doctor
from apps.notifications.models import Notification
from core.pagination import StandardResultsSetPagination
from django.db.models import Q


def _get_qs(request):
    qs = Appointment.objects.select_related('patient__user', 'doctor__user').all()
    status = request.query_params.get('status')
    doctor_id = request.query_params.get('doctorId')
    patient_id = request.query_params.get('patientId')
    if status:
        qs = qs.filter(status=status)
    if doctor_id:
        qs = qs.filter(doctor_id=doctor_id)
    if patient_id:
        qs = qs.filter(patient_id=patient_id)
    return qs


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def appointment_list(request):
    if request.method == 'GET':
        qs = _get_qs(request)
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

    if request.method == 'GET':
        return Response(AppointmentSerializer(appt).data)

    if request.method == 'PUT':
        for field in ['date', 'time', 'status', 'notes']:
            if field in request.data:
                setattr(appt, field, request.data[field])
        appt.save()
        return Response(AppointmentSerializer(appt).data)

    appt.delete()
    return Response({'message': 'Appointment cancelled'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_appointment(request, pk):
    try:
        appt = Appointment.objects.select_related('patient__user', 'doctor__user').get(pk=pk)
    except Appointment.DoesNotExist:
        return Response({'error': 'Not Found', 'message': 'Appointment not found'}, status=404)
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
    appt.status = 'cancelled'
    appt.save()
    return Response(AppointmentSerializer(appt).data)
