"""
Views for the notifications app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from django.utils import timezone

from .models import Notification
from .serializers import NotificationSerializer, NotificationListSerializer
from .services import NotificationService


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only viewset for user notifications.
    Notifications are created via backend services rather than API posts.
    """
    queryset = Notification.objects.all()
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filter_fields = ['is_read', 'notification_type']
    ordering = ['-created_at']

    def get_queryset(self):
        # Users only access their own notifications
        return super().get_queryset().filter(recipient=self.request.user)

    def get_serializer_class(self):
        if self.action == 'list':
            return NotificationListSerializer
        return NotificationSerializer

    @action(detail=True, methods=['post'])
    def read(self, request, pk=None):
        notification = self.get_object()
        NotificationService.mark_read(notification)
        return Response({'success': True, 'data': NotificationSerializer(notification).data})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        unread = self.get_queryset().filter(is_read=False)
        count = unread.update(is_read=True, read_at=timezone.now())
        return Response({'success': True, 'message': f"Marked {count} notifications as read."})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'success': True, 'data': {'unread_count': count}})
