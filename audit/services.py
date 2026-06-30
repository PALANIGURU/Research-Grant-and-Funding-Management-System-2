"""
Services for the audit app.
"""
from django.utils import timezone
from django.db.models import Count
from datetime import timedelta
from .models import AuditLog, AuditAction


class AuditService:
    """Service layer managing programmatic logging and aggregates."""

    @staticmethod
    def log_action(user, action, model_name, object_id='', object_repr='', changes=None, ip_address=None, **kwargs):
        """Programmatically create a custom audit log entry."""
        return AuditLog.objects.create(
            user=user,
            action=action,
            model_name=model_name,
            object_id=str(object_id),
            object_repr=object_repr,
            changes=changes or {},
            ip_address=ip_address,
            additional_data=kwargs
        )

    @staticmethod
    def get_user_activity(user, limit=50):
        """Query recent logs for a specific user."""
        return AuditLog.objects.filter(user=user)[:limit]

    @staticmethod
    def get_model_history(model_name, object_id):
        """Retrieve full changes trace history for an object."""
        return AuditLog.objects.filter(model_name=model_name, object_id=str(object_id))

    @staticmethod
    def get_activity_stats(days=30):
        """Retrieve aggregated stats on audit actions."""
        since = timezone.now() - timedelta(days=days)
        action_stats = (
            AuditLog.objects.filter(created_at__gte=since)
            .values('action')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        
        user_stats = (
            AuditLog.objects.filter(created_at__gte=since)
            .values('user__email')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )

        return {
            'by_action': {item['action']: item['count'] for item in action_stats},
            'top_users': {item['user__email'] or 'System': item['count'] for item in user_stats}
        }
