from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import Conversation, ChatMessage
from .serializers import ConversationSerializer, ChatMessageSerializer, UserBriefSerializer
from apps.accounts.models import User


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

    ChatMessage.objects.filter(conversation=convo).exclude(sender=request.user).update(is_read=True)

    messages = convo.messages.select_related('sender').all()
    serializer = ChatMessageSerializer(messages, many=True)
    return Response(serializer.data)


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
