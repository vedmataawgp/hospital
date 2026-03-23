from rest_framework import serializers
from .models import Conversation, ChatMessage
from apps.accounts.models import User


class UserBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role']


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.name', read_only=True)
    sender_role = serializers.CharField(source='sender.role', read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'sender_name', 'sender_role', 'message_type',
                  'text', 'file_url', 'file_name', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'sender_name', 'sender_role', 'is_read', 'created_at']


class ConversationSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'other_user', 'last_message', 'unread_count', 'updated_at']

    def get_other_user(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        other = obj.get_other_participant(request.user)
        if not other:
            return None
        return UserBriefSerializer(other).data

    def get_last_message(self, obj):
        msg = obj.get_last_message()
        if not msg:
            return None
        return {
            'text': msg.text or ('[Image]' if msg.message_type == 'image' else '[File]'),
            'created_at': msg.created_at,
            'sender_name': msg.sender.name,
        }

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request:
            return 0
        return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
