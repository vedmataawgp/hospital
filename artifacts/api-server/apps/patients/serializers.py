from rest_framework import serializers
from .models import Patient
from apps.accounts.models import User


class PatientSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    userId = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = Patient
        fields = ['id', 'userId', 'name', 'email', 'age', 'gender', 'phone', 'address', 'blood_group', 'created_at']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['bloodGroup'] = ret.pop('blood_group', None)
        ret['createdAt'] = ret.pop('created_at', None)
        return ret


class CreatePatientSerializer(serializers.Serializer):
    name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    age = serializers.IntegerField(required=False, allow_null=True)
    gender = serializers.ChoiceField(choices=['male', 'female', 'other'], required=False, allow_null=True)
    phone = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    address = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    bloodGroup = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already exists.')
        return value
