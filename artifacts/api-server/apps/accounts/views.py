from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        role = user.role
        if role == 'patient':
            from apps.patients.models import Patient
            Patient.objects.get_or_create(user=user)
        elif role == 'doctor':
            from apps.doctors.models import Doctor
            Doctor.objects.get_or_create(user=user, defaults={'specialization': 'General'})
        token = get_tokens_for_user(user)
        return Response({'token': token, 'user': UserSerializer(user).data}, status=status.HTTP_201_CREATED)
    return Response({'error': 'Bad Request', 'message': str(serializer.errors)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token = get_tokens_for_user(user)
        return Response({'token': token, 'user': UserSerializer(user).data})
    return Response({'error': 'Unauthorized', 'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    return Response(UserSerializer(request.user).data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    from .serializers import UpdateUserSerializer
    serializer = UpdateUserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(UserSerializer(request.user).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def contact(request):
    name    = request.data.get('name', '').strip()
    email   = request.data.get('email', '').strip()
    subject = request.data.get('subject', '').strip()
    message = request.data.get('message', '').strip()
    if not name or not email or not message:
        return Response({'error': 'name, email, and message are required'}, status=status.HTTP_400_BAD_REQUEST)
    return Response({'message': f'Thank you {name}, we received your message and will reply to {email} shortly.'})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def consultations(request):
    from apps.appointments.models import Appointment
    from apps.appointments.serializers import AppointmentSerializer
    if request.method == 'GET':
        return Response([])
    appointment_id = request.data.get('appointment_id')
    if not appointment_id:
        return Response({'error': 'appointment_id required'}, status=400)
    try:
        appt = Appointment.objects.get(id=appointment_id)
        return Response({'id': appt.id, 'appointment_id': appt.id, 'doctor': appt.doctor.user.name, 'patient': appt.patient.user.name})
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found'}, status=404)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def consultation_messages(request, pk):
    if request.method == 'GET':
        return Response([])
    text = request.data.get('text', '').strip()
    if not text:
        return Response({'error': 'text required'}, status=400)
    from django.utils import timezone
    return Response({
        'id': 1,
        'text': text,
        'sender': request.user.name,
        'created_at': timezone.now().isoformat(),
    }, status=201)
