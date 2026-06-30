"""
Audit middleware for logging write requests.
"""
import json
import logging
from django.utils.deprecation import MiddlewareMixin
from .models import AuditLog, AuditAction

logger = logging.getLogger('grants_system')


class AuditMiddleware(MiddlewareMixin):
    """
    Middleware that captures all mutating API requests (POST, PUT, PATCH, DELETE)
    and records them to the AuditLog.
    """

    def process_response(self, request, response):
        # Skip GET, HEAD, OPTIONS
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return response

        # Skip paths we don't want to audit (auth logins, token creation, admin docs, raw admin pages)
        path = request.path
        skip_prefixes = [
            '/admin/',
            '/api/auth/login/',
            '/api/auth/token/refresh/',
            '/api/schema/',
            '/api/docs/',
        ]
        
        for prefix in skip_prefixes:
            if path.startswith(prefix):
                return response

        # Skip static assets
        if path.startswith('/static/') or path.startswith('/media/'):
            return response

        try:
            self._log_request(request, response)
        except Exception as e:
            # Never crash the main request lifecycle if audit logging fails
            logger.error(f"Audit log middleware failure: {str(e)}", exc_info=True)

        return response

    def _log_request(self, request, response):
        user = request.user if request.user and request.user.is_authenticated else None
        
        # Map HTTP methods to actions
        method_map = {
            'POST': AuditAction.CREATE,
            'PUT': AuditAction.UPDATE,
            'PATCH': AuditAction.UPDATE,
            'DELETE': AuditAction.DELETE,
        }
        action = method_map.get(request.method, AuditAction.OTHER)

        # Get IP address
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0].strip()
        else:
            ip_address = request.META.get('REMOTE_ADDR')

        # Determine object references from URL (e.g. /api/grants/opportunities/{id}/)
        path_parts = request.path.strip('/').split('/')
        model_name = 'Unknown'
        object_id = ''
        
        if len(path_parts) >= 2:
            model_name = path_parts[1].capitalize()
            if len(path_parts) >= 3:
                # Assuming UUIDs or numeric IDs are the third segment
                object_id = path_parts[2]

        # Extract changes (rudimentary parser for post fields, exclude passwords)
        changes = {}
        if request.method in ['POST', 'PUT', 'PATCH']:
            try:
                # Make sure we don't double read stream if not needed
                body = request.body.decode('utf-8')
                if body:
                    data = json.loads(body)
                    # Filter out sensitive fields
                    sensitive = ['password', 'password_confirm', 'old_password', 'new_password', 'new_password_confirm']
                    changes = {k: v for k, v in data.items() if k not in sensitive}
            except Exception:
                pass

        # Create record
        AuditLog.objects.create(
            user=user,
            action=action,
            model_name=model_name,
            object_id=object_id,
            object_repr=f"{request.method} {request.path}",
            changes=changes,
            ip_address=ip_address,
            user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
            request_method=request.method,
            request_path=request.path,
            response_status=response.status_code
        )
