from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Doctor
from .serializers import DoctorSerializer, CreateDoctorSerializer
from apps.accounts.models import User
from core.pagination import StandardResultsSetPagination
from django.db.models import Q


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def doctor_list(request):
    if request.method == 'GET':
        search = request.query_params.get('search', '')
        specialization = request.query_params.get('specialization', '')
        qs = Doctor.objects.select_related('user').all()
        if search:
            qs = qs.filter(Q(user__name__icontains=search) | Q(specialization__icontains=search))
        elif specialization:
            qs = qs.filter(specialization__icontains=specialization)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = DoctorSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    if not request.user.is_authenticated:
        return Response({'error': 'Unauthorized', 'message': 'Authentication required'}, status=401)

    serializer = CreateDoctorSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'error': 'Bad Request', 'message': str(serializer.errors)}, status=400)
    data = serializer.validated_data
    user = User.objects.create_user(
        email=data['email'],
        name=data['name'],
        password=data['password'],
        role='doctor',
        is_staff=False,
    )
    doctor = Doctor.objects.create(
        user=user,
        specialization=data['specialization'],
        experience=data.get('experience', 0),
        phone=data.get('phone', ''),
        availability=data.get('availability', ''),
        bio=data.get('bio', ''),
    )
    return Response(DoctorSerializer(doctor).data, status=201)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def doctor_detail(request, pk):
    try:
        doctor = Doctor.objects.select_related('user').get(pk=pk)
    except Doctor.DoesNotExist:
        return Response({'error': 'Not Found', 'message': 'Doctor not found'}, status=404)

    if request.method == 'GET':
        return Response(DoctorSerializer(doctor).data)

    if not request.user.is_authenticated:
        return Response({'error': 'Unauthorized', 'message': 'Authentication required'}, status=401)

    if request.method == 'PUT':
        data = request.data
        if 'name' in data:
            doctor.user.name = data['name']
            doctor.user.save()
        if 'specialization' in data:
            doctor.specialization = data['specialization']
        if 'experience' in data:
            doctor.experience = data['experience']
        if 'phone' in data:
            doctor.phone = data['phone']
        if 'availability' in data:
            doctor.availability = data['availability']
        if 'bio' in data:
            doctor.bio = data['bio']
        doctor.save()
        return Response(DoctorSerializer(doctor).data)

    doctor.user.delete()
    return Response({'message': 'Doctor deleted successfully'})
