from rest_framework import serializers
from .models import Doctor
from apps.accounts.models import User


class DoctorSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    userId = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = Doctor
        fields = ['id', 'userId', 'name', 'email', 'specialization', 'experience', 'phone', 'availability', 'bio', 'created_at']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['createdAt'] = ret.pop('created_at', None)
        return ret


class CreateDoctorSerializer(serializers.Serializer):
    name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    specialization = serializers.CharField()
    experience = serializers.IntegerField(required=False, default=0)
    phone = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    availability = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    bio = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already exists.')
        return value
