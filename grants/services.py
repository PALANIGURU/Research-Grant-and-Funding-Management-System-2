"""
Business services for the grants app.
"""
import logging
from django.db.models import Count, Sum
from core.exceptions import BusinessLogicError
from .models import Grant, GrantStatus

logger = logging.getLogger('grants_system')


class GrantService:
    """Service class encapsulating grant business workflows."""

    @staticmethod
    def transition_status(grant, new_status, user):
        """
        Transition a grant's status checking appropriate rules.
        """
        old_status = grant.status

        if old_status == new_status:
            return grant

        # Allowed transitions
        allowed = {
            GrantStatus.DRAFT: [GrantStatus.OPEN, GrantStatus.CANCELLED],
            GrantStatus.OPEN: [GrantStatus.CLOSED, GrantStatus.CANCELLED],
            GrantStatus.CLOSED: [GrantStatus.AWARDED, GrantStatus.CANCELLED],
            GrantStatus.AWARDED: [GrantStatus.COMPLETED, GrantStatus.CANCELLED],
            GrantStatus.COMPLETED: [],
            GrantStatus.CANCELLED: [],
        }

        if new_status not in allowed.get(old_status, []):
            raise BusinessLogicError(
                f"Cannot transition grant from {old_status} to {new_status}."
            )

        # Apply specific rules
        if new_status == GrantStatus.OPEN:
            if not grant.title or not grant.description:
                raise BusinessLogicError("Grant title and description cannot be empty before opening.")
            if grant.total_amount <= 0:
                raise BusinessLogicError("Grant funding amount must be greater than zero.")

        grant.status = new_status
        grant.save(update_fields=['status'])
        
        logger.info(
            f"Grant {grant.reference_number} status updated from {old_status} "
            f"to {new_status} by {user.email}"
        )
        return grant

    @staticmethod
    def get_grant_statistics():
        """Get aggregate grant overview data."""
        stats = Grant.objects.values('status').annotate(
            count=Count('id'),
            total_funding=Sum('total_amount')
        )
        
        summary = {
            'total_count': Grant.objects.count(),
            'total_funding': Grant.objects.aggregate(total=Sum('total_amount'))['total'] or 0,
            'by_status': {item['status']: {'count': item['count'], 'funding': item['total_funding']} for item in stats}
        }
        return summary
