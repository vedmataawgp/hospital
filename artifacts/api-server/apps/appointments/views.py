from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from .models import Appointment, Prescription
from .serializers import AppointmentSerializer, PrescriptionSerializer
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
    if user.role == 'admin':
        return True
    if user.role == 'doctor':
        return hasattr(user, 'doctor_profile') and user.doctor_profile == appt.doctor
    if user.role == 'patient':
        return hasattr(user, 'patient_profile') and user.patient_profile == appt.patient
    return False


def _send_appointment_email(patient_email, patient_name, doctor_name, date, time, subject, action):
    try:
        send_mail(
            subject=subject,
            message=f'Hello {patient_name},\n\nYour appointment with Dr. {doctor_name} on {date} at {time} has been {action}.\n\nThank you,\nMediCare Hospital',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[patient_email],
            fail_silently=True,
        )
    except Exception:
        pass


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

    conflict = Appointment.objects.filter(
        doctor=doctor, date=date, time=time, status__in=['pending', 'confirmed']
    ).exists()
    if conflict:
        return Response({'error': 'Conflict', 'message': 'This time slot is already booked for the selected doctor. Please choose another time.'}, status=409)

    appt = Appointment.objects.create(
        patient=patient, doctor=doctor, date=date, time=time, notes=notes
    )
    Notification.objects.create(
        user=patient.user,
        message=f'Your appointment has been booked for {date} at {time}',
        type='appointment',
    )
    _send_appointment_email(
        patient.user.email, patient.user.name, doctor.user.name, date, time,
        'Appointment Booking Confirmation — MediCare', 'booked successfully'
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
    _send_appointment_email(
        appt.patient.user.email, appt.patient.user.name, appt.doctor.user.name,
        appt.date, appt.time, 'Appointment Confirmed — MediCare', 'confirmed'
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
    _send_appointment_email(
        appt.patient.user.email, appt.patient.user.name, appt.doctor.user.name,
        appt.date, appt.time, 'Appointment Cancelled — MediCare', 'cancelled'
    )
    return Response(AppointmentSerializer(appt).data)


# ── Prescriptions ──────────────────────────────────────────────────────────────
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def prescription_list(request):
    role = request.user.role

    if request.method == 'GET':
        qs = Prescription.objects.select_related('patient__user', 'doctor__user', 'appointment')
        if role == 'doctor':
            try:
                doctor = Doctor.objects.get(user=request.user)
                qs = qs.filter(doctor=doctor)
            except Doctor.DoesNotExist:
                return Response([])
        elif role == 'patient':
            try:
                patient = Patient.objects.get(user=request.user)
                qs = qs.filter(patient=patient)
            except Patient.DoesNotExist:
                return Response([])
        elif role != 'admin':
            return Response({'error': 'Forbidden'}, status=403)

        patient_id = request.query_params.get('patientId')
        if patient_id and role in ('admin', 'doctor'):
            qs = qs.filter(patient_id=patient_id)

        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(PrescriptionSerializer(page, many=True).data)

    if role not in ('admin', 'doctor'):
        return Response({'error': 'Forbidden', 'message': 'Only doctors and admins can create prescriptions.'}, status=403)

    data = request.data
    patient_id = data.get('patientId') or data.get('patient_id')
    if not patient_id:
        return Response({'error': 'Bad Request', 'message': 'patientId is required.'}, status=400)
    for field in ('medication', 'dosage', 'frequency', 'duration'):
        if not data.get(field):
            return Response({'error': 'Bad Request', 'message': f'{field} is required.'}, status=400)

    try:
        patient = Patient.objects.get(pk=patient_id)
    except Patient.DoesNotExist:
        return Response({'error': 'Not Found', 'message': 'Patient not found.'}, status=404)

    if role == 'doctor':
        try:
            doctor = Doctor.objects.get(user=request.user)
        except Doctor.DoesNotExist:
            return Response({'error': 'Doctor profile not found'}, status=404)
    else:
        doctor_id = data.get('doctorId') or data.get('doctor_id')
        try:
            doctor = Doctor.objects.get(pk=doctor_id)
        except Doctor.DoesNotExist:
            return Response({'error': 'Not Found', 'message': 'Doctor not found.'}, status=404)

    appointment = None
    appt_id = data.get('appointmentId') or data.get('appointment_id')
    if appt_id:
        try:
            appointment = Appointment.objects.get(pk=appt_id)
        except Appointment.DoesNotExist:
            pass

    prescription = Prescription.objects.create(
        appointment=appointment,
        patient=patient,
        doctor=doctor,
        medication=data['medication'],
        dosage=data['dosage'],
        frequency=data['frequency'],
        duration=data['duration'],
        instructions=data.get('instructions', ''),
    )
    Notification.objects.create(
        user=patient.user,
        message=f'New prescription: {data["medication"]} — from Dr. {doctor.user.name}',
        type='system',
    )
    try:
        send_mail(
            subject='New Prescription — MediCare Hospital',
            message=f'Hello {patient.user.name},\n\nDr. {doctor.user.name} has issued a new prescription for you:\n\nMedication: {data["medication"]}\nDosage: {data["dosage"]}\nFrequency: {data["frequency"]}\nDuration: {data["duration"]}\nInstructions: {data.get("instructions", "None")}\n\nThank you,\nMediCare Hospital',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[patient.user.email],
            fail_silently=True,
        )
    except Exception:
        pass
    return Response(PrescriptionSerializer(prescription).data, status=201)


@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def prescription_detail(request, pk):
    try:
        rx = Prescription.objects.select_related('patient__user', 'doctor__user', 'appointment').get(pk=pk)
    except Prescription.DoesNotExist:
        return Response({'error': 'Not Found'}, status=404)

    role = request.user.role
    if role == 'patient':
        try:
            if Patient.objects.get(user=request.user) != rx.patient:
                return Response({'error': 'Forbidden'}, status=403)
        except Patient.DoesNotExist:
            return Response({'error': 'Forbidden'}, status=403)
    elif role == 'doctor':
        try:
            if Doctor.objects.get(user=request.user) != rx.doctor:
                return Response({'error': 'Forbidden'}, status=403)
        except Doctor.DoesNotExist:
            return Response({'error': 'Forbidden'}, status=403)

    if request.method == 'GET':
        return Response(PrescriptionSerializer(rx).data)

    if role not in ('admin', 'doctor'):
        return Response({'error': 'Forbidden', 'message': 'Only doctors and admins can delete prescriptions.'}, status=403)
    rx.delete()
    return Response({'message': 'Prescription deleted.'})
