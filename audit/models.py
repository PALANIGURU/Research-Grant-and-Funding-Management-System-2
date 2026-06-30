"""
Models for the audit app.
"""
from django.db import models
from django.conf import settings
from core.mixins import TimeStampedModel


class AuditAction(models.TextChoices):
    CREATE = 'CREATE', 'Create'
    UPDATE = 'UPDATE', 'Update'
    DELETE = 'DELETE', 'Delete'
    LOGIN = 'LOGIN', 'User Login'
    LOGOUT = 'LOGOUT', 'User Logout'
    STATUS_CHANGE = 'STATUS_CHANGE', 'Status Transition'
    APPROVAL = 'APPROVAL', 'Approval'
    REJECTION = 'REJECTION', 'Rejection'
    OTHER = 'OTHER', 'Other'


class AuditLog(TimeStampedModel):
    """Immutable audit logs tracking system write activity and status updates."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
    )
    action = models.CharField(
        max_length=20,
        choices=AuditAction.choices,
        db_index=True,
    )
    model_name = models.CharField(max_length=100, db_index=True)
    object_id = models.CharField(max_length=50, blank=True)
    object_repr = models.CharField(max_length=500, blank=True)
    changes = models.JSONField(
        default=dict,
        blank=True,
        help_text='JSON structured list of field delta changes: {field: {old: val, new: val}}',
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    request_method = models.CharField(max_length=10, blank=True)
    request_path = models.CharField(max_length=500, blank=True)
    response_status = models.PositiveIntegerField(null=True, blank=True)
    additional_data = models.JSONField(default=dict, blank=True)

    class Meta:
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        ordering = ['-created_at']

    def __str__(self):
        user_str = self.user.email if self.user else 'System'
        return f"{self.action} on {self.model_name} by {user_str}"
