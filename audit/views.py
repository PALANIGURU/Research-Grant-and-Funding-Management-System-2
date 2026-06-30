"""
Views for the audit app.
"""
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from accounts.permissions import IsAdmin
from .models import AuditLog
from .serializers import AuditLogSerializer, AuditLogListSerializer
from .filters import AuditLogFilter
from .services import AuditService


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Admin-only read viewset to view system audit trails.
    """
    queryset = AuditLog.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = AuditLogFilter
    search_fields = ['model_name', 'object_repr', 'request_path']
    ordering_fields = ['created_at', 'response_status']
    ordering = ['-created_at']

    def get_permissions(self):
        return [IsAuthenticated(), IsAdmin()]

    def get_serializer_class(self):
        if self.action == 'list':
            return AuditLogListSerializer
        return AuditLogSerializer

    @action(detail=False, methods=['get'])
    def stats(self, request):
        stats = AuditService.get_activity_stats(days=30)
        return Response({'success': True, 'data': stats})
