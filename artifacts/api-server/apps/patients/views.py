from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Patient
from .serializers import PatientSerializer, CreatePatientSerializer
from apps.accounts.models import User
from core.pagination import StandardResultsSetPagination
from django.db.models import Q


# ── Admin/staff: patient list / create ────────────────────────────────────────
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def patient_list(request):
    if request.method == 'GET':
        search = request.query_params.get('search', '')
        qs = Patient.objects.select_related('user').all()
        if search:
            qs = qs.filter(Q(user__name__icontains=search) | Q(user__email__icontains=search))
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(PatientSerializer(page, many=True).data)

    serializer = CreatePatientSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'error': 'Bad Request', 'message': str(serializer.errors)}, status=400)
    data = serializer.validated_data
    user = User.objects.create_user(
        email=data['email'], name=data['name'],
        password=data['password'], role='patient',
    )
    patient = Patient.objects.create(
        user=user, age=data.get('age'), gender=data.get('gender'),
        phone=data.get('phone', ''), address=data.get('address', ''),
        blood_group=data.get('bloodGroup', ''),
    )
    return Response(PatientSerializer(patient).data, status=201)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def patient_detail(request, pk):
    try:
        patient = Patient.objects.select_related('user').get(pk=pk)
    except Patient.DoesNotExist:
        return Response({'error': 'Not Found', 'message': 'Patient not found'}, status=404)

    if request.method == 'GET':
        return Response(PatientSerializer(patient).data)

    if request.method == 'PUT':
        data = request.data
        if 'name' in data: patient.user.name = data['name']; patient.user.save()
        for f, k in [('age', 'age'), ('gender', 'gender'), ('phone', 'phone'),
                     ('address', 'address'), ('blood_group', 'bloodGroup')]:
            if k in data: setattr(patient, f, data[k])
        patient.save()
        return Response(PatientSerializer(patient).data)

    patient.user.delete()
    return Response({'message': 'Patient deleted successfully'})


# ── Patient portal (logged-in patient's own data) ─────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_portal_dashboard(request):
    from apps.appointments.models import Appointment
    from apps.appointments.serializers import AppointmentSerializer
    from apps.billing.models import Billing
    from apps.billing.serializers import BillingSerializer
    from apps.reports.models import Report

    try:
        patient = Patient.objects.get(user=request.user)
    except Patient.DoesNotExist:
        return Response({'error': 'Patient profile not found'}, status=404)

    appts = Appointment.objects.select_related('doctor__user').filter(patient=patient)
    recent_appts = appts.order_by('-created_at')[:5]
    upcoming = appts.filter(status__in=['pending', 'confirmed']).order_by('date')[:3]
    pending_bills = Billing.objects.filter(patient=patient, status='pending')
    reports = Report.objects.filter(patient=patient)

    return Response({
        'totalAppointments':    appts.count(),
        'upcomingAppointments': appts.filter(status__in=['pending', 'confirmed']).count(),
        'completedAppointments':appts.filter(status='completed').count(),
        'pendingBills':         pending_bills.count(),
        'totalReports':         reports.count(),
        'recentAppointments':   AppointmentSerializer(recent_appts, many=True).data,
        'upcomingList':         AppointmentSerializer(upcoming, many=True).data,
        'patient':              PatientSerializer(patient).data,
    })


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def patient_portal_profile(request):
    try:
        patient = Patient.objects.select_related('user').get(user=request.user)
    except Patient.DoesNotExist:
        return Response({'error': 'Patient profile not found'}, status=404)

    if request.method == 'GET':
        return Response(PatientSerializer(patient).data)

    data = request.data
    if 'name' in data: patient.user.name = data['name']; patient.user.save()
    for f, k in [('age', 'age'), ('gender', 'gender'), ('phone', 'phone'),
                 ('address', 'address'), ('blood_group', 'bloodGroup')]:
        if k in data: setattr(patient, f, data[k])
    patient.save()
    return Response(PatientSerializer(patient).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_portal_reports(request):
    from apps.reports.models import Report
    from apps.reports.serializers import ReportSerializer

    try:
        patient = Patient.objects.get(user=request.user)
    except Patient.DoesNotExist:
        return Response({'error': 'Patient profile not found'}, status=404)

    reports = Report.objects.filter(patient=patient).order_by('-created_at')
    return Response(ReportSerializer(reports, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_portal_invoices(request):
    from apps.billing.models import Billing
    from apps.billing.serializers import BillingSerializer

    try:
        patient = Patient.objects.get(user=request.user)
    except Patient.DoesNotExist:
        return Response({'error': 'Patient profile not found'}, status=404)

    bills = Billing.objects.filter(patient=patient).order_by('-created_at')
    return Response(BillingSerializer(bills, many=True).data)
