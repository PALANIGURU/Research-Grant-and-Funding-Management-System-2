"""
Django admin registrations for the audit app.
"""
from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'model_name', 'object_repr', 'user', 'response_status', 'created_at')
    list_filter = ('action', 'model_name', 'response_status', 'created_at')
    search_fields = ('model_name', 'object_repr', 'user__email', 'request_path')
    raw_id_fields = ('user',)
    
    # Audit log entries must be read-only to ensure tamper-proof trace tracking
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def get_readonly_fields(self, request, obj=None):
        return [f.name for f in self.model._meta.fields]
