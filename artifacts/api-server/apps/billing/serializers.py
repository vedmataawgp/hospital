from rest_framework import serializers
from .models import Billing


class BillingSerializer(serializers.ModelSerializer):
    patientId = serializers.IntegerField(source='patient.id', read_only=True)
    patientName = serializers.CharField(source='patient.user.name', read_only=True)
    appointmentId = serializers.IntegerField(source='appointment.id', read_only=True, allow_null=True)

    class Meta:
        model = Billing
        fields = ['id', 'patientId', 'patientName', 'appointmentId', 'amount', 'description',
                  'status', 'payment_method', 'paid_at', 'created_at']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['paymentMethod'] = ret.pop('payment_method', None)
        ret['paidAt'] = ret.pop('paid_at', None)
        ret['createdAt'] = ret.pop('created_at', None)
        return ret
