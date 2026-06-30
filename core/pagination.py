"""
Custom pagination classes for the Research Grant & Funding Management System.
"""
from rest_framework.pagination import PageNumberPagination


class StandardResultsPagination(PageNumberPagination):
    """Standard pagination with configurable page size."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class LargeResultsPagination(PageNumberPagination):
    """Pagination for endpoints that may return larger datasets."""
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200


class SmallResultsPagination(PageNumberPagination):
    """Pagination for endpoints with smaller result sets."""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50
