"""
Custom exception handler for the Research Grant & Funding Management System.
Provides consistent error response format across all API endpoints.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger('grants_system')


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns consistent error responses.
    
    Response format:
    {
        "success": false,
        "error": {
            "code": "error_code",
            "message": "Human-readable message",
            "details": { ... }  // optional
        }
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        custom_response = {
            'success': False,
            'error': {
                'code': _get_error_code(response.status_code),
                'message': _get_error_message(response),
                'details': response.data if isinstance(response.data, dict) else {'detail': response.data},
            }
        }
        response.data = custom_response
    else:
        # Unhandled exceptions
        logger.exception(f"Unhandled exception in {context.get('view', 'unknown')}: {exc}")
        response = Response(
            {
                'success': False,
                'error': {
                    'code': 'internal_server_error',
                    'message': 'An unexpected error occurred. Please try again later.',
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return response


def _get_error_code(status_code):
    """Map HTTP status codes to error code strings."""
    code_map = {
        400: 'bad_request',
        401: 'unauthorized',
        403: 'forbidden',
        404: 'not_found',
        405: 'method_not_allowed',
        409: 'conflict',
        422: 'unprocessable_entity',
        429: 'rate_limit_exceeded',
        500: 'internal_server_error',
    }
    return code_map.get(status_code, f'error_{status_code}')


def _get_error_message(response):
    """Extract a human-readable message from the response data."""
    if isinstance(response.data, dict):
        if 'detail' in response.data:
            return str(response.data['detail'])
        # Collect field errors
        messages = []
        for field, errors in response.data.items():
            if isinstance(errors, list):
                messages.append(f"{field}: {', '.join(str(e) for e in errors)}")
            else:
                messages.append(f"{field}: {errors}")
        return '; '.join(messages) if messages else 'An error occurred.'
    elif isinstance(response.data, list):
        return '; '.join(str(e) for e in response.data)
    return str(response.data)


class BusinessLogicError(Exception):
    """
    Custom exception for business rule violations.
    Use in services.py when a business rule is violated.
    """
    def __init__(self, message, code='business_rule_violation', status_code=400):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(self.message)
