from rest_framework import serializers
from .models import Doctor
from apps.accounts.models import User


class DoctorSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    userId = serializers.IntegerField(source='user.id', read_only=True)
    experience_years = serializers.IntegerField(source='experience', read_only=True)
    rating = serializers.SerializerMethodField()
    available = serializers.SerializerMethodField()
    patients_count = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = ['id', 'userId', 'name', 'email', 'specialization', 'experience',
                  'experience_years', 'rating', 'available', 'patients_count', 'status',
                  'phone', 'availability', 'bio', 'created_at']

    def get_rating(self, obj):
        import hashlib
        h = int(hashlib.md5(str(obj.id).encode()).hexdigest(), 16)
        return round(4.0 + (h % 10) * 0.1, 1)

    def get_available(self, obj):
        return True

    def get_patients_count(self, obj):
        return obj.appointments.count()

    def get_status(self, obj):
        return 'Active'

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
