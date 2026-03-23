from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Doctor
from .serializers import DoctorSerializer, CreateDoctorSerializer
from apps.accounts.models import User
from core.pagination import StandardResultsSetPagination
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


# ── Public: Doctor list / create ───────────────────────────────────────────────
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

    if not request.user.is_authenticated:
        return Response({'error': 'Unauthorized'}, status=401)
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

    if not request.user.is_authenticated:
        return Response({'error': 'Unauthorized'}, status=401)

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
        Doctor.objects.get(pk=pk)
    except Doctor.DoesNotExist:
        return Response({'error': 'Not Found'}, status=404)
    return Response({'slots': [
        "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
        "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
        "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
    ]})


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
    from apps.notifications.models import Notification

    try:
        Doctor.objects.get(user=request.user)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, status=404)

    PREFIX = 'PRESCRIPTION|'

    if request.method == 'GET':
        notes = Notification.objects.filter(
            user=request.user, type='system', message__startswith=PREFIX
        ).order_by('-created_at')[:20]
        result = []
        for n in notes:
            try:
                _, patient_name, rx_notes = n.message.split('|', 2)
            except ValueError:
                patient_name, rx_notes = '', n.message
            result.append({'id': n.id, 'patient_name': patient_name, 'notes': rx_notes, 'created_at': n.created_at})
        return Response(result)

    patient_name = request.data.get('patient_name', '').strip()
    notes_text   = request.data.get('notes', '').strip()
    if not patient_name:
        return Response({'error': 'patient_name required'}, status=400)

    n = Notification.objects.create(
        user=request.user,
        type='system',
        message=f'{PREFIX}{patient_name}|{notes_text}',
    )
    return Response({'id': n.id, 'patient_name': patient_name, 'notes': notes_text, 'created_at': n.created_at}, status=201)
