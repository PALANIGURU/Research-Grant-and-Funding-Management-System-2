"""
Filters for the audit app.
"""
from django_filters import rest_framework as filters
from .models import AuditLog


class AuditLogFilter(filters.FilterSet):
    action = filters.CharFilter(field_name='action', lookup_expr='exact')
    model_name = filters.CharFilter(field_name='model_name', lookup_expr='exact')
    user = filters.UUIDFilter(field_name='user', lookup_expr='exact')
    response_status = filters.NumberFilter(field_name='response_status')

    created_after = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = AuditLog
        fields = ['action', 'model_name', 'user', 'response_status']
