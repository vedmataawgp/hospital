import time
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import Conversation, ChatMessage
from .serializers import ConversationSerializer, ChatMessageSerializer, UserBriefSerializer
from apps.accounts.models import User
from apps.appointments.models import Appointment

# In-memory typing state: { convo_id: { user_id: timestamp } }
_typing_state: dict = {}


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_conversations(request):
    convos = Conversation.objects.filter(participants=request.user).prefetch_related('participants', 'messages')
    serializer = ConversationSerializer(convos, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_conversation(request):
    other_user_id = request.data.get('user_id')
    if not other_user_id:
        return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        other_user = User.objects.get(id=other_user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if other_user == request.user:
        return Response({'error': 'Cannot chat with yourself'}, status=status.HTTP_400_BAD_REQUEST)

    existing = Conversation.objects.filter(
        participants=request.user
    ).filter(
        participants=other_user
    ).first()

    if existing:
        serializer = ConversationSerializer(existing, context={'request': request})
        return Response(serializer.data)

    convo = Conversation.objects.create()
    convo.participants.add(request.user, other_user)
    serializer = ConversationSerializer(convo, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conversation_messages(request, convo_id):
    try:
        convo = Conversation.objects.get(id=convo_id, participants=request.user)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)

    # Mark incoming messages as read
    ChatMessage.objects.filter(conversation=convo).exclude(sender=request.user).update(is_read=True)

    messages = convo.messages.select_related('sender')

    # Support incremental fetch: ?after=<msg_id> returns only newer messages
    after_id = request.query_params.get('after')
    if after_id:
        try:
            messages = messages.filter(id__gt=int(after_id))
        except (ValueError, TypeError):
            pass

    serializer = ChatMessageSerializer(messages.all(), many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_read(request, convo_id):
    try:
        convo = Conversation.objects.get(id=convo_id, participants=request.user)
    except Conversation.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    updated = ChatMessage.objects.filter(conversation=convo).exclude(sender=request.user).update(is_read=True)
    return Response({'marked': updated})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def typing_status(request, convo_id):
    TYPING_TTL = 4  # seconds — typing expires if no update
    try:
        convo = Conversation.objects.get(id=convo_id, participants=request.user)
    except Conversation.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    now = time.time()

    if request.method == 'POST':
        is_typing = request.data.get('typing', False)
        if convo_id not in _typing_state:
            _typing_state[convo_id] = {}
        if is_typing:
            _typing_state[convo_id][request.user.id] = now
        else:
            _typing_state[convo_id].pop(request.user.id, None)
        return Response({'ok': True})

    # GET: return whether the other participant is currently typing
    other_user = convo.get_other_participant(request.user)
    if not other_user:
        return Response({'typing': False})

    convo_typing = _typing_state.get(convo_id, {})
    last_ts = convo_typing.get(other_user.id, 0)
    is_typing = (now - last_ts) < TYPING_TTL
    return Response({'typing': is_typing})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request, convo_id):
    try:
        convo = Conversation.objects.get(id=convo_id, participants=request.user)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)

    text = request.data.get('text', '').strip()
    message_type = request.data.get('message_type', 'text')
    file_url = request.data.get('file_url')
    file_name = request.data.get('file_name')

    if not text and not file_url:
        return Response({'error': 'Message must have text or file'}, status=status.HTTP_400_BAD_REQUEST)

    msg = ChatMessage.objects.create(
        conversation=convo,
        sender=request.user,
        text=text,
        message_type=message_type,
        file_url=file_url,
        file_name=file_name,
    )

    convo.save()

    serializer = ChatMessageSerializer(msg)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    query = request.query_params.get('q', '').strip()
    role = request.query_params.get('role', '')

    users = User.objects.exclude(id=request.user.id).filter(is_active=True)

    if role in ('doctor', 'patient'):
        users = users.filter(role=role)

    if query:
        users = users.filter(
            Q(name__icontains=query) | Q(email__icontains=query)
        )

    users = users[:20]
    serializer = UserBriefSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def appointment_contacts(request):
    user = request.user
    contact_users = []

    if user.role == 'patient':
        from apps.patients.models import Patient
        try:
            patient = Patient.objects.get(user=user)
            appts = Appointment.objects.filter(
                patient=patient,
                status__in=['pending', 'confirmed', 'completed']
            ).select_related('doctor__user').order_by('-created_at')
            seen = set()
            for a in appts:
                if a.doctor.user_id not in seen:
                    seen.add(a.doctor.user_id)
                    contact_users.append({
                        'id': a.doctor.user.id,
                        'name': a.doctor.user.name,
                        'email': a.doctor.user.email,
                        'role': 'doctor',
                        'appointment_status': a.status,
                        'appointment_date': str(a.date),
                    })
        except Patient.DoesNotExist:
            pass

    elif user.role == 'doctor':
        from apps.doctors.models import Doctor
        try:
            doctor = Doctor.objects.get(user=user)
            appts = Appointment.objects.filter(
                doctor=doctor,
                status__in=['pending', 'confirmed', 'completed']
            ).select_related('patient__user').order_by('-created_at')
            seen = set()
            for a in appts:
                if a.patient.user_id not in seen:
                    seen.add(a.patient.user_id)
                    contact_users.append({
                        'id': a.patient.user.id,
                        'name': a.patient.user.name,
                        'email': a.patient.user.email,
                        'role': 'patient',
                        'appointment_status': a.status,
                        'appointment_date': str(a.date),
                    })
        except Doctor.DoesNotExist:
            pass

    return Response(contact_users)
