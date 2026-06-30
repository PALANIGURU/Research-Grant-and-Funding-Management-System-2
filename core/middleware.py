"""
Request logging middleware for performance monitoring.
"""
import time
import logging

logger = logging.getLogger('grants_system.requests')


class RequestLoggingMiddleware:
    """
    Middleware that logs all incoming requests with timing information
    for performance monitoring and debugging.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()

        # Get user info
        user = getattr(request, 'user', None)
        user_info = str(user) if user and user.is_authenticated else 'anonymous'

        response = self.get_response(request)

        # Calculate request duration
        duration = time.time() - start_time

        # Log the request
        logger.info(
            "%(method)s %(path)s %(status)s %(duration).3fs [%(user)s]",
            {
                'method': request.method,
                'path': request.get_full_path(),
                'status': response.status_code,
                'duration': duration,
                'user': user_info,
            }
        )

        # Add timing header to response
        response['X-Request-Duration'] = f"{duration:.3f}s"

        return response
