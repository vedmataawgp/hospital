from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Report
from .serializers import ReportSerializer
from apps.patients.models import Patient
from core.pagination import StandardResultsSetPagination
from core.permissions import IsAdmin, IsAdminOrDoctor


def _reports_qs_for_user(request):
    """Scope report records to the requesting user's role."""
    role = request.user.role
    qs = Report.objects.select_related('patient__user')

    if role == 'admin':
        pass
    elif role == 'doctor':
        pass
    elif role == 'patient':
        try:
            patient = Patient.objects.get(user=request.user)
            qs = qs.filter(patient=patient)
        except Patient.DoesNotExist:
            return qs.none()
    else:
        return qs.none()

    patient_id = request.query_params.get('patientId')
    if patient_id and role in ('admin', 'doctor'):
        qs = qs.filter(patient_id=patient_id)
    return qs


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def report_list(request):
    if request.method == 'GET':
        qs = _reports_qs_for_user(request)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(ReportSerializer(page, many=True).data)

    if request.user.role not in ('admin', 'doctor'):
        return Response({'error': 'Forbidden', 'message': 'Only admins and doctors can create reports.'}, status=403)

    data = request.data
    patient_id = data.get('patientId')
    if not patient_id or not data.get('title') or not data.get('reportType'):
        return Response({'error': 'Bad Request', 'message': 'patientId, title, reportType required'}, status=400)
    try:
        patient = Patient.objects.get(pk=patient_id)
    except Patient.DoesNotExist:
        return Response({'error': 'Not Found', 'message': 'Patient not found'}, status=404)

    report = Report.objects.create(
        patient=patient,
        title=data['title'],
        description=data.get('description', ''),
        file_url=data.get('fileUrl', ''),
        report_type=data.get('reportType', 'other'),
    )
    return Response(ReportSerializer(report).data, status=201)


@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def report_detail(request, pk):
    try:
        report = Report.objects.select_related('patient__user').get(pk=pk)
    except Report.DoesNotExist:
        return Response({'error': 'Not Found', 'message': 'Report not found'}, status=404)

    role = request.user.role
    if role == 'admin':
        pass
    elif role == 'doctor':
        pass
    elif role == 'patient':
        try:
            patient = Patient.objects.get(user=request.user)
            if report.patient != patient:
                return Response({'error': 'Forbidden', 'message': 'You can only access your own reports.'}, status=403)
        except Patient.DoesNotExist:
            return Response({'error': 'Forbidden'}, status=403)
    else:
        return Response({'error': 'Forbidden'}, status=403)

    if request.method == 'GET':
        return Response(ReportSerializer(report).data)

    if role not in ('admin', 'doctor'):
        return Response({'error': 'Forbidden', 'message': 'Only admins and doctors can delete reports.'}, status=403)

    report.delete()
    return Response({'message': 'Report deleted'})
