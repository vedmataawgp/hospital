from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    userId = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'userId', 'message', 'type', 'status', 'created_at']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['createdAt'] = ret.pop('created_at', None)
        return ret
