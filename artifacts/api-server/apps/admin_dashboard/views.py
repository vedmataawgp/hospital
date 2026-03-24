import random
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from apps.patients.models import Patient
from apps.patients.serializers import PatientSerializer
from apps.doctors.models import Doctor
from apps.doctors.serializers import DoctorSerializer
from apps.appointments.models import Appointment
from apps.appointments.serializers import AppointmentSerializer
from apps.billing.models import Billing
from apps.billing.serializers import BillingSerializer
from apps.accounts.models import User
from apps.accounts.serializers import UserSerializer
from core.pagination import StandardResultsSetPagination
from core.permissions import IsAdmin
from django.db.models import Sum, Q


def _build_overview():
    total_patients = Patient.objects.count()
    total_doctors = Doctor.objects.count()
    total_appointments = Appointment.objects.count()
    pending_appointments = Appointment.objects.filter(status='pending').count()
    confirmed_appointments = Appointment.objects.filter(status='confirmed').count()
    total_revenue = Billing.objects.filter(status='paid').aggregate(total=Sum('amount'))['total'] or 0
    pending_billing = Billing.objects.filter(status='pending').aggregate(total=Sum('amount'))['total'] or 0
    recent_appts = Appointment.objects.select_related('patient__user', 'doctor__user').order_by('-created_at')[:5]
    recent_patients = Patient.objects.select_related('user').order_by('-created_at')[:5]
    return {
        'totalPatients': total_patients,
        'totalDoctors': total_doctors,
        'totalAppointments': total_appointments,
        'pendingAppointments': pending_appointments,
        'confirmedAppointments': confirmed_appointments,
        'totalRevenue': float(total_revenue),
        'pendingBilling': float(pending_billing),
        'recentAppointments': AppointmentSerializer(recent_appts, many=True).data,
        'recentPatients': PatientSerializer(recent_patients, many=True).data,
    }


@api_view(['GET'])
@permission_classes([IsAdmin])
def dashboard(request):
    return Response(_build_overview())


@api_view(['GET'])
@permission_classes([IsAdmin])
def overview(request):
    return Response(_build_overview())


@api_view(['GET'])
@permission_classes([IsAdmin])
def analytics(request):
    period = request.query_params.get('period', 'month')
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    if period == 'week':
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    elif period == 'year':
        labels = months
    else:
        labels = months[:6]

    data = [{'label': l, 'appointments': random.randint(10, 60), 'revenue': random.randint(1000, 8000), 'patients': random.randint(5, 25)} for l in labels]
    pending = Appointment.objects.filter(status='pending').count()
    confirmed = Appointment.objects.filter(status='confirmed').count()
    cancelled = Appointment.objects.filter(status='cancelled').count()
    completed = Appointment.objects.filter(status='completed').count()
    return Response({
        'period': period, 'data': data,
        'appointmentsByStatus': {'pending': pending, 'confirmed': confirmed, 'cancelled': cancelled, 'completed': completed},
        'revenueByMonth': [{'month': m, 'revenue': random.randint(2000, 12000)} for m in months],
    })


@api_view(['GET'])
@permission_classes([IsAdmin])
def user_list(request):
    role = request.query_params.get('role')
    search = request.query_params.get('search', '')
    qs = User.objects.all()
    if role: qs = qs.filter(role=role)
    if search: qs = qs.filter(Q(name__icontains=search) | Q(email__icontains=search))
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(qs, request)
    return paginator.get_paginated_response(UserSerializer(page, many=True).data)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAdmin])
def user_detail(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'Not Found', 'message': 'User not found'}, status=404)

    if request.method == 'DELETE':
        if user.pk == request.user.pk:
            return Response({'error': 'Forbidden', 'message': 'You cannot delete your own account.'}, status=403)
        user.delete()
        return Response({'message': 'User deleted'})

    for field in ['name', 'email', 'role']:
        if field in request.data: setattr(user, field, request.data[field])
    user.save()
    return Response(UserSerializer(user).data)


# ── Admin: doctors CRUD ────────────────────────────────────────────────────────
@api_view(['GET', 'POST'])
@permission_classes([IsAdmin])
def admin_doctors(request):
    if request.method == 'GET':
        qs = Doctor.objects.select_related('user').prefetch_related('appointments').all()
        return Response(DoctorSerializer(qs, many=True).data)

    from apps.accounts.serializers import RegisterSerializer
    data = request.data.copy()
    data['role'] = 'doctor'
    serializer = RegisterSerializer(data=data)
    if not serializer.is_valid():
        return Response({'error': str(serializer.errors)}, status=400)
    user = serializer.save()
    doctor = Doctor.objects.create(
        user=user,
        specialization=request.data.get('specialization', 'General'),
        experience=request.data.get('experience', 0),
    )
    return Response(DoctorSerializer(doctor).data, status=201)


@api_view(['DELETE'])
@permission_classes([IsAdmin])
def admin_doctor_detail(request, pk):
    try:
        doctor = Doctor.objects.get(pk=pk)
        doctor.user.delete()
        return Response({'message': 'Doctor removed'})
    except Doctor.DoesNotExist:
        return Response({'error': 'Not Found'}, status=404)


# ── Admin: patients list ───────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_patients(request):
    qs = Patient.objects.select_related('user').all()
    return Response(PatientSerializer(qs, many=True).data)


# ── Admin: appointments list ───────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_appointments(request):
    qs = Appointment.objects.select_related('patient__user', 'doctor__user').order_by('-created_at')
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(qs, request)
    return paginator.get_paginated_response(AppointmentSerializer(page, many=True).data)
