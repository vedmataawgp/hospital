from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Doctor
from .serializers import DoctorSerializer, CreateDoctorSerializer
from apps.accounts.models import User
from core.pagination import StandardResultsSetPagination
from core.permissions import IsAdmin, IsAdminOrDoctor
from django.db.models import Q

# Static department catalogue
DEPARTMENTS = [
    {'id': 1,  'icon_key': 'heart-pulse-fill',    'name': 'Cardiology',       'description': 'Heart & cardiovascular care'},
    {'id': 2,  'icon_key': 'activity',             'name': 'Neurology',        'description': 'Brain & nervous system disorders'},
    {'id': 3,  'icon_key': 'person-circle',        'name': 'Pediatrics',       'description': "Children's health & development"},
    {'id': 4,  'icon_key': 'bandaid-fill',         'name': 'Orthopedics',      'description': 'Bones, joints & musculoskeletal'},
    {'id': 5,  'icon_key': 'eye-fill',             'name': 'Ophthalmology',    'description': 'Eye care & vision health'},
    {'id': 6,  'icon_key': 'lungs-fill',           'name': 'Pulmonology',      'description': 'Lung & respiratory care'},
    {'id': 7,  'icon_key': 'gender-female',        'name': 'Gynecology',       'description': "Women's reproductive health"},
    {'id': 8,  'icon_key': 'capsule-pill',         'name': 'General Medicine', 'description': 'Primary & preventive care'},
]


# ── Public: Doctor list / Admin: create ───────────────────────────────────────
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def doctor_list(request):
    if request.method == 'GET':
        search = request.query_params.get('search', '')
        specialization = request.query_params.get('specialization', '')
        qs = Doctor.objects.select_related('user').prefetch_related('appointments').all()
        if search:
            qs = qs.filter(Q(user__name__icontains=search) | Q(specialization__icontains=search))
        elif specialization:
            qs = qs.filter(specialization__icontains=specialization)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(DoctorSerializer(page, many=True).data)

    if not request.user or not request.user.is_authenticated:
        return Response({'error': 'Unauthorized'}, status=401)
    if request.user.role != 'admin':
        return Response({'error': 'Forbidden', 'message': 'Only admins can create doctors.'}, status=403)

    serializer = CreateDoctorSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'error': 'Bad Request', 'message': str(serializer.errors)}, status=400)
    data = serializer.validated_data
    user = User.objects.create_user(email=data['email'], name=data['name'], password=data['password'], role='doctor')
    doctor = Doctor.objects.create(
        user=user, specialization=data['specialization'],
        experience=data.get('experience', 0), phone=data.get('phone', ''),
        availability=data.get('availability', ''), bio=data.get('bio', ''),
    )
    return Response(DoctorSerializer(doctor).data, status=201)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def doctor_detail(request, pk):
    try:
        doctor = Doctor.objects.select_related('user').prefetch_related('appointments').get(pk=pk)
    except Doctor.DoesNotExist:
        return Response({'error': 'Not Found'}, status=404)

    if request.method == 'GET':
        return Response(DoctorSerializer(doctor).data)

    if not request.user or not request.user.is_authenticated:
        return Response({'error': 'Unauthorized'}, status=401)
    if request.user.role != 'admin':
        return Response({'error': 'Forbidden', 'message': 'Only admins can modify doctors.'}, status=403)

    if request.method == 'PUT':
        data = request.data
        if 'name' in data: doctor.user.name = data['name']; doctor.user.save()
        for field in ('specialization', 'experience', 'phone', 'availability', 'bio'):
            if field in data: setattr(doctor, field, data[field])
        doctor.save()
        return Response(DoctorSerializer(doctor).data)

    doctor.user.delete()
    return Response({'message': 'Doctor deleted successfully'})


@api_view(['GET'])
@permission_classes([AllowAny])
def doctor_availability(request, pk):
    try:
        doctor = Doctor.objects.get(pk=pk)
    except Doctor.DoesNotExist:
        return Response({'error': 'Not Found'}, status=404)

    date_str = request.query_params.get('date')
    if date_str:
        import datetime
        from apps.appointments.models import Appointment
        try:
            target_date = datetime.date.fromisoformat(date_str)
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

        day_of_week = target_date.weekday()
        from .models import DoctorSchedule
        try:
            schedule = DoctorSchedule.objects.get(doctor=doctor, day_of_week=day_of_week, is_available=True)
            all_slots = schedule.generate_slots()
        except DoctorSchedule.DoesNotExist:
            all_slots = [
                "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
                "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
                "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
            ]

        booked = set(Appointment.objects.filter(
            doctor=doctor, date=date_str, status__in=['pending', 'confirmed']
        ).values_list('time', flat=True))
        slots = [{'time': s, 'available': s not in booked} for s in all_slots]
        return Response({'date': date_str, 'slots': slots})

    return Response({'slots': [
        "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
        "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
        "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
    ]})


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def doctor_schedule(request, pk):
    try:
        doctor = Doctor.objects.get(pk=pk)
    except Doctor.DoesNotExist:
        return Response({'error': 'Not Found'}, status=404)

    if request.user.role not in ('admin', 'doctor'):
        return Response({'error': 'Forbidden'}, status=403)
    if request.user.role == 'doctor':
        try:
            if Doctor.objects.get(user=request.user) != doctor:
                return Response({'error': 'Forbidden', 'message': 'You can only manage your own schedule.'}, status=403)
        except Doctor.DoesNotExist:
            return Response({'error': 'Forbidden'}, status=403)

    from .models import DoctorSchedule, DAYS_OF_WEEK

    if request.method == 'GET':
        schedules = DoctorSchedule.objects.filter(doctor=doctor)
        return Response([{
            'id': s.id,
            'day_of_week': s.day_of_week,
            'day_name': dict(DAYS_OF_WEEK)[s.day_of_week],
            'start_time': s.start_time.strftime('%H:%M'),
            'end_time': s.end_time.strftime('%H:%M'),
            'slot_duration_minutes': s.slot_duration_minutes,
            'is_available': s.is_available,
        } for s in schedules])

    if request.method == 'POST':
        day = request.data.get('day_of_week')
        start = request.data.get('start_time')
        end = request.data.get('end_time')
        if day is None or not start or not end:
            return Response({'error': 'day_of_week, start_time, end_time required'}, status=400)
        s, _ = DoctorSchedule.objects.update_or_create(
            doctor=doctor, day_of_week=day,
            defaults={
                'start_time': start, 'end_time': end,
                'slot_duration_minutes': request.data.get('slot_duration_minutes', 30),
                'is_available': request.data.get('is_available', True),
            }
        )
        return Response({'id': s.id, 'day_of_week': s.day_of_week, 'day_name': dict(DAYS_OF_WEEK)[s.day_of_week], 'start_time': s.start_time.strftime('%H:%M'), 'end_time': s.end_time.strftime('%H:%M'), 'slot_duration_minutes': s.slot_duration_minutes, 'is_available': s.is_available}, status=201)

    return Response({'error': 'Method not allowed'}, status=405)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_patients(request, pk):
    try:
        doctor = Doctor.objects.get(pk=pk)
    except Doctor.DoesNotExist:
        return Response({'error': 'Not Found'}, status=404)

    if request.user.role == 'doctor':
        try:
            if Doctor.objects.get(user=request.user) != doctor:
                return Response({'error': 'Forbidden'}, status=403)
        except Doctor.DoesNotExist:
            return Response({'error': 'Forbidden'}, status=403)
    elif request.user.role not in ('admin',):
        return Response({'error': 'Forbidden'}, status=403)

    from apps.appointments.models import Appointment
    from apps.patients.models import Patient
    from apps.patients.serializers import PatientSerializer
    from apps.reports.models import Report
    from apps.reports.serializers import ReportSerializer

    patient_id = request.query_params.get('patientId')
    if patient_id:
        try:
            patient = Patient.objects.select_related('user').get(pk=patient_id)
        except Patient.DoesNotExist:
            return Response({'error': 'Not Found'}, status=404)
        appts = Appointment.objects.filter(doctor=doctor, patient=patient).order_by('-created_at')
        reports = Report.objects.filter(patient=patient).order_by('-created_at')
        from apps.billing.models import Billing
        from apps.billing.serializers import BillingSerializer
        from apps.appointments.serializers import AppointmentSerializer
        bills = Billing.objects.filter(patient=patient).order_by('-created_at')
        return Response({
            'patient': PatientSerializer(patient).data,
            'appointments': AppointmentSerializer(appts, many=True).data,
            'reports': ReportSerializer(reports, many=True).data,
            'billing': BillingSerializer(bills, many=True).data,
        })

    patient_ids = Appointment.objects.filter(doctor=doctor).values_list('patient_id', flat=True).distinct()
    patients = Patient.objects.filter(id__in=patient_ids).select_related('user')
    return Response(PatientSerializer(patients, many=True).data)


# ── Departments (static catalogue, doctor count from DB) ───────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def department_list(request):
    total = Doctor.objects.count()
    result = []
    for dept in DEPARTMENTS:
        count = Doctor.objects.filter(specialization__icontains=dept['name']).count()
        result.append({**dept, 'doctors_count': count or max(1, total // len(DEPARTMENTS))})
    return Response(result)


@api_view(['GET'])
@permission_classes([AllowAny])
def department_detail(request, pk):
    dept = next((d for d in DEPARTMENTS if d['id'] == pk), None)
    if not dept:
        return Response({'error': 'Not Found'}, status=404)
    return Response({**dept, 'doctors_count': Doctor.objects.filter(specialization__icontains=dept['name']).count()})


# ── Doctor portal (logged-in doctor's own data) ────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_portal_dashboard(request):
    from apps.appointments.models import Appointment
    from apps.appointments.serializers import AppointmentSerializer

    try:
        doctor = Doctor.objects.prefetch_related('appointments').get(user=request.user)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, status=404)

    appts = Appointment.objects.select_related('patient__user').filter(doctor=doctor)
    recent = appts.order_by('-created_at')[:5]

    return Response({
        'totalPatients':         appts.values('patient').distinct().count(),
        'todayAppointments':     appts.filter(status__in=['pending', 'confirmed']).count(),
        'pendingAppointments':   appts.filter(status='pending').count(),
        'completedAppointments': appts.filter(status='completed').count(),
        'recentAppointments':    AppointmentSerializer(recent, many=True).data,
        'doctor':                DoctorSerializer(doctor).data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_portal_patients(request):
    from apps.patients.models import Patient
    from apps.patients.serializers import PatientSerializer
    from apps.appointments.models import Appointment

    try:
        doctor = Doctor.objects.get(user=request.user)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, status=404)

    patient_ids = Appointment.objects.filter(doctor=doctor).values_list('patient_id', flat=True).distinct()
    patients = Patient.objects.filter(id__in=patient_ids).select_related('user')
    return Response(PatientSerializer(patients, many=True).data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def doctor_portal_prescriptions(request):
    from apps.appointments.models import Prescription
    from apps.appointments.serializers import PrescriptionSerializer

    try:
        doctor = Doctor.objects.get(user=request.user)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, status=404)

    if request.method == 'GET':
        prescriptions = Prescription.objects.filter(doctor=doctor).select_related(
            'patient__user', 'appointment'
        ).order_by('-created_at')[:50]
        return Response(PrescriptionSerializer(prescriptions, many=True).data)

    from apps.patients.models import Patient
    patient_id = request.data.get('patient_id')
    appointment_id = request.data.get('appointment_id')
    medication = request.data.get('medication', '').strip()
    dosage = request.data.get('dosage', '').strip()
    frequency = request.data.get('frequency', '').strip()
    duration = request.data.get('duration', '').strip()
    instructions = request.data.get('instructions', '').strip()

    if not patient_id:
        return Response({'error': 'patient_id is required'}, status=400)
    if not medication:
        return Response({'error': 'medication is required'}, status=400)

    try:
        patient = Patient.objects.get(pk=patient_id)
    except Patient.DoesNotExist:
        return Response({'error': 'Patient not found'}, status=404)

    from apps.appointments.models import Appointment
    appointment = None
    if appointment_id:
        try:
            appointment = Appointment.objects.get(pk=appointment_id, doctor=doctor, patient=patient)
        except Appointment.DoesNotExist:
            return Response({'error': 'Appointment not found or not associated with this doctor/patient pair'}, status=404)

    prescription = Prescription.objects.create(
        doctor=doctor,
        patient=patient,
        appointment=appointment,
        medication=medication,
        dosage=dosage,
        frequency=frequency,
        duration=duration,
        instructions=instructions,
    )
    return Response(PrescriptionSerializer(prescription).data, status=201)
