"""
Shared utility functions for the Research Grant & Funding Management System.
"""
from django.utils import timezone


def get_current_fiscal_year():
    """Return the current fiscal year (assuming April-March fiscal year)."""
    now = timezone.now()
    if now.month >= 4:
        return f"{now.year}-{now.year + 1}"
    return f"{now.year - 1}-{now.year}"


def calculate_percentage(part, total):
    """Calculate percentage safely, avoiding division by zero."""
    if total == 0:
        return 0
    return round((part / total) * 100, 2)


def generate_reference_number(prefix, pk):
    """Generate a human-readable reference number."""
    from datetime import datetime
    date_part = datetime.now().strftime('%Y%m')
    return f"{prefix}-{date_part}-{str(pk)[:8].upper()}"
