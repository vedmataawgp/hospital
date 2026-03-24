import secrets
from datetime import timedelta
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
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
        try:
            send_mail(
                subject='Welcome to MediCare Hospital',
                message=f'Hello {user.name},\n\nYour account has been created successfully.\n\nRole: {user.role.title()}\n\nThank you for joining MediCare Hospital.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception:
            pass
        return Response({'token': token, 'user': UserSerializer(user, context={'request': request}).data}, status=status.HTTP_201_CREATED)
    return Response({'error': 'Bad Request', 'message': str(serializer.errors)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token = get_tokens_for_user(user)
        return Response({'token': token, 'user': UserSerializer(user, context={'request': request}).data})
    return Response({'error': 'Unauthorized', 'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    return Response(UserSerializer(request.user, context={'request': request}).data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    from .serializers import UpdateUserSerializer
    serializer = UpdateUserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(UserSerializer(request.user, context={'request': request}).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_avatar(request):
    if 'avatar' not in request.FILES:
        return Response({'error': 'Bad Request', 'message': 'No file uploaded. Use field name "avatar".'}, status=400)
    file = request.FILES['avatar']
    if file.size > 5 * 1024 * 1024:
        return Response({'error': 'Bad Request', 'message': 'File size must be under 5MB.'}, status=400)
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if file.content_type not in allowed_types:
        return Response({'error': 'Bad Request', 'message': 'Only JPEG, PNG, GIF, and WebP images are allowed.'}, status=400)
    if request.user.avatar:
        try:
            request.user.avatar.delete(save=False)
        except Exception:
            pass
    request.user.avatar = file
    request.user.save()
    return Response(UserSerializer(request.user, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    email = request.data.get('email', '').strip().lower()
    if not email:
        return Response({'error': 'email is required'}, status=400)
    try:
        user = User.objects.get(email=email)
        token = secrets.token_urlsafe(32)
        user.password_reset_token = token
        user.password_reset_expires = timezone.now() + timedelta(hours=1)
        user.save()
        reset_url = f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5000')}/auth/reset-password?token={token}&email={email}"
        send_mail(
            subject='Reset your MediCare password',
            message=f'Hello {user.name},\n\nClick the link below to reset your password (expires in 1 hour):\n\n{reset_url}\n\nIf you did not request this, please ignore this email.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=True,
        )
    except User.DoesNotExist:
        pass
    return Response({'message': 'If an account with that email exists, you will receive a reset link shortly.'})


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    email = request.data.get('email', '').strip().lower()
    token = request.data.get('token', '').strip()
    new_password = request.data.get('password', '')
    if not email or not token or not new_password:
        return Response({'error': 'email, token, and password are required'}, status=400)
    if len(new_password) < 8:
        return Response({'error': 'Password must be at least 8 characters.'}, status=400)
    try:
        user = User.objects.get(email=email, password_reset_token=token)
    except User.DoesNotExist:
        return Response({'error': 'Invalid or expired reset link.'}, status=400)
    if user.password_reset_expires and timezone.now() > user.password_reset_expires:
        return Response({'error': 'Reset link has expired. Please request a new one.'}, status=400)
    user.set_password(new_password)
    user.password_reset_token = None
    user.password_reset_expires = None
    user.save()
    return Response({'message': 'Password reset successfully. You can now sign in with your new password.'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    old_password = request.data.get('old_password', '')
    new_password = request.data.get('new_password', '')
    if not old_password or not new_password:
        return Response({'error': 'old_password and new_password are required'}, status=400)
    if not request.user.check_password(old_password):
        return Response({'error': 'Current password is incorrect.'}, status=400)
    if len(new_password) < 8:
        return Response({'error': 'New password must be at least 8 characters.'}, status=400)
    request.user.set_password(new_password)
    request.user.save()
    return Response({'message': 'Password changed successfully.'})


@api_view(['POST'])
@permission_classes([AllowAny])
def contact(request):
    name    = request.data.get('name', '').strip()
    email   = request.data.get('email', '').strip()
    subject = request.data.get('subject', '').strip()
    message = request.data.get('message', '').strip()
    if not name or not email or not message:
        return Response({'error': 'name, email, and message are required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        send_mail(
            subject=f'[MediCare Contact] {subject or "General Inquiry"}',
            message=f'From: {name} <{email}>\n\n{message}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.EMAIL_HOST_USER or 'admin@medicare.hospital'],
            fail_silently=True,
        )
    except Exception:
        pass
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
    return Response({
        'id': 1,
        'text': text,
        'sender': request.user.name,
        'created_at': timezone.now().isoformat(),
    }, status=201)
