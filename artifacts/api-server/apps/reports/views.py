from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Report
from .serializers import ReportSerializer
from apps.patients.models import Patient
from core.pagination import StandardResultsSetPagination


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def report_list(request):
    if request.method == 'GET':
        qs = Report.objects.select_related('patient__user').all()
        patient_id = request.query_params.get('patientId')
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request)
        return paginator.get_paginated_response(ReportSerializer(page, many=True).data)

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
    if request.method == 'GET':
        return Response(ReportSerializer(report).data)
    report.delete()
    return Response({'message': 'Report deleted'})
