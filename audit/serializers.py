"""
Serializers for the audit app.
"""
from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = '__all__'

    def get_user_email(self, obj):
        return obj.user.email if obj.user else 'System'


class AuditLogListSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            'id', 'user_email', 'action', 'model_name', 'object_repr',
            'request_method', 'request_path', 'response_status', 'created_at',
        ]

    def get_user_email(self, obj):
        return obj.user.email if obj.user else 'System'
