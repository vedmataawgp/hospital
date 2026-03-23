from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    patientId = serializers.IntegerField(source='patient.id', read_only=True)
    patientName = serializers.CharField(source='patient.user.name', read_only=True)

    class Meta:
        model = Report
        fields = ['id', 'patientId', 'patientName', 'title', 'description', 'file_url', 'report_type', 'created_at']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['fileUrl'] = ret.pop('file_url', None)
        ret['reportType'] = ret.pop('report_type', None)
        ret['createdAt'] = ret.pop('created_at', None)
        return ret
