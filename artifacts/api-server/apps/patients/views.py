from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Patient
from .serializers import PatientSerializer, CreatePatientSerializer
from apps.accounts.models import User
from core.pagination import StandardResultsSetPagination
from django.db.models import Q


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
        serializer = PatientSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    serializer = CreatePatientSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'error': 'Bad Request', 'message': str(serializer.errors)}, status=400)
    data = serializer.validated_data
    user = User.objects.create_user(
        email=data['email'],
        name=data['name'],
        password=data['password'],
        role='patient',
    )
    patient = Patient.objects.create(
        user=user,
        age=data.get('age'),
        gender=data.get('gender'),
        phone=data.get('phone', ''),
        address=data.get('address', ''),
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
        if 'name' in data:
            patient.user.name = data['name']
            patient.user.save()
        if 'age' in data:
            patient.age = data['age']
        if 'gender' in data:
            patient.gender = data['gender']
        if 'phone' in data:
            patient.phone = data['phone']
        if 'address' in data:
            patient.address = data['address']
        if 'bloodGroup' in data:
            patient.blood_group = data['bloodGroup']
        patient.save()
        return Response(PatientSerializer(patient).data)

    patient.user.delete()
    return Response({'message': 'Patient deleted successfully'})
