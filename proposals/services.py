"""
Services for the proposals app.
"""
import logging
from django.utils import timezone
from django.db.models import Avg
from core.exceptions import BusinessLogicError
from .models import Proposal, ProposalStatus

logger = logging.getLogger('grants_system')


class ProposalService:
    """Service layer encapsulating proposal workflows."""

    @staticmethod
    def submit_proposal(proposal, user):
        """Submit a proposal opportunity."""
        if proposal.submitted_by != user:
            raise BusinessLogicError("You can only submit your own proposals.")

        if proposal.status not in [ProposalStatus.DRAFT, ProposalStatus.REVISION_REQUESTED]:
            raise BusinessLogicError("Only draft or revision-requested proposals can be submitted.")

        if not proposal.title or not proposal.abstract or not proposal.methodology:
            raise BusinessLogicError("Title, abstract, and methodology must be filled out before submitting.")

        # Verify grant is still open
        if not proposal.grant.is_open:
            raise BusinessLogicError("The opportunity is closed. Submissions no longer accepted.")

        proposal.status = ProposalStatus.SUBMITTED
        proposal.submitted_at = timezone.now()
        proposal.save(update_fields=['status', 'submitted_at'])
        
        logger.info(f"Proposal {proposal.reference_number} submitted by {user.email}")
        return proposal

    @staticmethod
    def transition_status(proposal, new_status, user, **kwargs):
        """Manage proposal status transition state machine."""
        old_status = proposal.status

        if old_status == new_status:
            return proposal

        # Allowed transitions
        allowed = {
            ProposalStatus.DRAFT: [ProposalStatus.SUBMITTED],
            ProposalStatus.SUBMITTED: [ProposalStatus.UNDER_REVIEW],
            ProposalStatus.UNDER_REVIEW: [ProposalStatus.APPROVED, ProposalStatus.REJECTED, ProposalStatus.REVISION_REQUESTED],
            ProposalStatus.APPROVED: [],
            ProposalStatus.REJECTED: [],
            ProposalStatus.REVISION_REQUESTED: [ProposalStatus.SUBMITTED],
        }

        if new_status not in allowed.get(old_status, []):
            raise BusinessLogicError(
                f"Cannot transition proposal status from {old_status} to {new_status}."
            )

        if new_status == ProposalStatus.REJECTED:
            reason = kwargs.get('rejection_reason', '')
            if not reason:
                raise BusinessLogicError("A reason must be provided to reject a proposal.")
            proposal.rejection_reason = reason
            proposal.reviewed_at = timezone.now()

        elif new_status == ProposalStatus.REVISION_REQUESTED:
            comments = kwargs.get('revision_comments', '')
            if not comments:
                raise BusinessLogicError("Revision comments must be provided.")
            proposal.revision_comments = comments

        elif new_status == ProposalStatus.APPROVED:
            proposal.reviewed_at = timezone.now()

        proposal.status = new_status
        proposal.save()

        logger.info(
            f"Proposal {proposal.reference_number} transitioned from {old_status} "
            f"to {new_status} by user {user.email}"
        )
        return proposal

    @staticmethod
    def calculate_average_score(proposal):
        """Compute the average evaluation score of a proposal."""
        return proposal.reviews.aggregate(avg=Avg('score'))['avg'] or 0.0
