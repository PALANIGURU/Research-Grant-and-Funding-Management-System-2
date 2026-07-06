"""
Services for the notifications app.
"""
import logging
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from .models import Notification, NotificationType

logger = logging.getLogger('grants_system')


class NotificationService:
    """Service layer for dispatching and managing notifications (in-app + email)."""

    # ---------- Core dispatch ----------

    @staticmethod
    def send_email(recipient, title, message, link=''):
        """Send an email alongside an in-app notification. Never raises —
        a failed email should never break the underlying business action."""
        try:
            body = message
            if link:
                body += f"\n\nView it here: {settings.FRONTEND_URL}{link}"
            send_mail(
                subject=f"[RGFMS] {title}",
                message=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient.email],
                fail_silently=False,
            )
        except Exception as exc:
            logger.warning(f"Failed to email {recipient.email}: {exc}")

    @staticmethod
    def send_notification(recipient, title, message, notification_type=NotificationType.SYSTEM, link='', related_object_type='', related_object_id=''):
        """Send a single in-app notification, plus an email."""
        notification = Notification.objects.create(
            recipient=recipient,
            title=title,
            message=message,
            notification_type=notification_type,
            link=link,
            related_object_type=related_object_type,
            related_object_id=str(related_object_id) if related_object_id else ''
        )
        logger.info(f"Notification sent to {recipient.email}: {title}")
        NotificationService.send_email(recipient, title, message, link)
        return notification

    @staticmethod
    def send_bulk_notification(recipients, title, message, notification_type=NotificationType.SYSTEM, link=''):
        """Send in-app notifications to multiple users in bulk, plus emails."""
        notifications = []
        for recipient in recipients:
            notifications.append(Notification(
                recipient=recipient,
                title=title,
                message=message,
                notification_type=notification_type,
                link=link
            ))

        created = Notification.objects.bulk_create(notifications)
        logger.info(f"Bulk notification sent to {len(created)} users: {title}")

        for recipient in recipients:
            NotificationService.send_email(recipient, title, message, link)

        return created

    @staticmethod
    def mark_read(notification):
        """Mark notification as read."""
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save(update_fields=['is_read', 'read_at'])
        return notification

    # ---------- Proposals ----------

    @staticmethod
    def notify_proposal_submitted(proposal):
        """Notify Grant Managers when a proposal is submitted."""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        managers = User.objects.filter(role='GRANT_MANAGER', is_active=True)

        title = f"New Proposal Submitted: {proposal.reference_number}"
        message = f"{proposal.submitted_by.get_full_name()} submitted a proposal titled '{proposal.title}'."
        link = f"/dashboard/proposals/{proposal.id}"

        NotificationService.send_bulk_notification(
            recipients=managers,
            title=title,
            message=message,
            notification_type=NotificationType.PROPOSAL_SUBMITTED,
            link=link
        )

    @staticmethod
    def notify_proposal_under_review(proposal):
        """Notify the applicant that their proposal has entered review."""
        title = f"Proposal Under Review: {proposal.reference_number}"
        message = f"Your proposal '{proposal.title}' is now under review."
        link = f"/dashboard/proposals/{proposal.id}"

        NotificationService.send_notification(
            recipient=proposal.submitted_by,
            title=title,
            message=message,
            notification_type=NotificationType.REVIEW_ASSIGNED,
            link=link,
            related_object_type='Proposal',
            related_object_id=proposal.id
        )

    @staticmethod
    def notify_proposal_approved(proposal):
        """Notify the applicant when their proposal is approved."""
        title = f"Proposal Approved! {proposal.reference_number}"
        message = f"Congratulations! Your proposal '{proposal.title}' has been approved."
        link = f"/dashboard/proposals/{proposal.id}"

        NotificationService.send_notification(
            recipient=proposal.submitted_by,
            title=title,
            message=message,
            notification_type=NotificationType.PROPOSAL_APPROVED,
            link=link,
            related_object_type='Proposal',
            related_object_id=proposal.id
        )

    @staticmethod
    def notify_proposal_rejected(proposal):
        """Notify the applicant when their proposal is rejected."""
        title = f"Proposal Update: {proposal.reference_number}"
        message = f"Your proposal '{proposal.title}' was reviewed and rejected. Reason: {proposal.rejection_reason}"
        link = f"/dashboard/proposals/{proposal.id}"

        NotificationService.send_notification(
            recipient=proposal.submitted_by,
            title=title,
            message=message,
            notification_type=NotificationType.PROPOSAL_REJECTED,
            link=link,
            related_object_type='Proposal',
            related_object_id=proposal.id
        )

    @staticmethod
    def notify_proposal_revision_requested(proposal):
        """Notify the applicant when revisions are requested."""
        title = f"Revision Requested: {proposal.reference_number}"
        message = f"Changes were requested on your proposal '{proposal.title}'. Comments: {proposal.revision_comments}"
        link = f"/dashboard/proposals/{proposal.id}"

        NotificationService.send_notification(
            recipient=proposal.submitted_by,
            title=title,
            message=message,
            notification_type=NotificationType.PROPOSAL_REVISION,
            link=link,
            related_object_type='Proposal',
            related_object_id=proposal.id
        )

    # ---------- Grants ----------

    @staticmethod
    def notify_grant_opened(grant):
        """Notify researchers and clients when a new grant opportunity is published."""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        applicants = User.objects.filter(role__in=['RESEARCHER', 'CLIENT'], is_active=True)

        title = f"New Grant Opportunity: {grant.reference_number}"
        message = f"A new grant '{grant.title}' is accepting proposals. Apply before {grant.application_deadline.strftime('%Y-%m-%d')}."
        link = f"/dashboard/grants/{grant.id}"

        NotificationService.send_bulk_notification(
            recipients=applicants,
            title=title,
            message=message,
            notification_type=NotificationType.GRANT_OPENED,
            link=link
        )

    @staticmethod
    def notify_grant_awarded(grant):
        """Notify the awarded proposal's applicant when a grant is awarded."""
        approved_proposal = grant.proposals.filter(status='APPROVED').first()
        if not approved_proposal:
            return

        title = f"Grant Awarded: {grant.reference_number}"
        message = f"The grant '{grant.title}' tied to your approved proposal has been officially awarded."
        link = f"/dashboard/grants/{grant.id}"

        NotificationService.send_notification(
            recipient=approved_proposal.submitted_by,
            title=title,
            message=message,
            notification_type=NotificationType.GRANT_AWARDED,
            link=link,
            related_object_type='Grant',
            related_object_id=grant.id
        )

    @staticmethod
    def notify_grant_completed(grant):
        """Notify the awarded proposal's applicant when a grant is marked completed."""
        approved_proposal = grant.proposals.filter(status='APPROVED').first()
        if not approved_proposal:
            return

        title = f"Grant Completed: {grant.reference_number}"
        message = f"The grant '{grant.title}' has been marked as completed."
        link = f"/dashboard/grants/{grant.id}"

        NotificationService.send_notification(
            recipient=approved_proposal.submitted_by,
            title=title,
            message=message,
            notification_type=NotificationType.GRANT_COMPLETED,
            link=link,
            related_object_type='Grant',
            related_object_id=grant.id
        )

    # ---------- Budgets / Disbursements ----------

    @staticmethod
    def notify_disbursement_approved(disbursement):
        title = f"Disbursement Approved: {disbursement.reference_number}"
        message = f"Your disbursement request of {disbursement.amount} for grant '{disbursement.budget.grant.title}' has been approved."
        link = f"/dashboard/budgets/{disbursement.budget.id}"

        NotificationService.send_notification(
            recipient=disbursement.requested_by,
            title=title,
            message=message,
            notification_type=NotificationType.DISBURSEMENT_APPROVED,
            link=link,
            related_object_type='Disbursement',
            related_object_id=disbursement.id
        )

    @staticmethod
    def notify_disbursement_rejected(disbursement):
        title = f"Disbursement Rejected: {disbursement.reference_number}"
        message = f"Your disbursement request of {disbursement.amount} was rejected. Reason: {disbursement.rejection_reason}"
        link = f"/dashboard/budgets/{disbursement.budget.id}"

        NotificationService.send_notification(
            recipient=disbursement.requested_by,
            title=title,
            message=message,
            notification_type=NotificationType.DISBURSEMENT_REJECTED,
            link=link,
            related_object_type='Disbursement',
            related_object_id=disbursement.id
        )

    @staticmethod
    def notify_disbursement_disbursed(disbursement):
        title = f"Funds Disbursed: {disbursement.reference_number}"
        message = f"{disbursement.amount} has been disbursed for grant '{disbursement.budget.grant.title}'."
        link = f"/dashboard/budgets/{disbursement.budget.id}"

        NotificationService.send_notification(
            recipient=disbursement.requested_by,
            title=title,
            message=message,
            notification_type=NotificationType.DISBURSEMENT_APPROVED,
            link=link,
            related_object_type='Disbursement',
            related_object_id=disbursement.id
        )

    # ---------- Milestones & Reports ----------

    @staticmethod
    def notify_milestone_overdue(milestone):
        if not milestone.assigned_to:
            return

        title = f"Milestone Overdue: {milestone.title}"
        message = f"The milestone '{milestone.title}' for grant '{milestone.grant.title}' is now overdue."
        link = f"/dashboard/reports"

        NotificationService.send_notification(
            recipient=milestone.assigned_to,
            title=title,
            message=message,
            notification_type=NotificationType.MILESTONE_OVERDUE,
            link=link,
            related_object_type='Milestone',
            related_object_id=milestone.id
        )

    @staticmethod
    def notify_progress_report_submitted(report):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        managers = User.objects.filter(role__in=['ADMIN', 'GRANT_MANAGER'], is_active=True)

        title = f"Progress Report Submitted: {report.report_number}"
        message = f"{report.submitted_by.get_full_name()} submitted a progress report for grant '{report.grant.title}'."
        link = f"/dashboard/reports"

        NotificationService.send_bulk_notification(
            recipients=managers,
            title=title,
            message=message,
            notification_type=NotificationType.REPORT_SUBMITTED,
            link=link
        )

    @staticmethod
    def notify_final_report_submitted(report):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        managers = User.objects.filter(role__in=['ADMIN', 'GRANT_MANAGER'], is_active=True)

        title = f"Final Report Submitted: {report.report_number}"
        message = f"{report.submitted_by.get_full_name()} submitted a final report for grant '{report.grant.title}'."
        link = f"/dashboard/reports"

        NotificationService.send_bulk_notification(
            recipients=managers,
            title=title,
            message=message,
            notification_type=NotificationType.REPORT_SUBMITTED,
            link=link
        )

    @staticmethod
    def notify_report_reviewed(report):
        title = f"Report Reviewed: {report.report_number}"
        message = f"Your report for grant '{report.grant.title}' has been reviewed. Status: {report.status}."
        link = f"/dashboard/reports"

        NotificationService.send_notification(
            recipient=report.submitted_by,
            title=title,
            message=message,
            notification_type=NotificationType.REPORT_REVIEWED,
            link=link,
            related_object_type='Report',
            related_object_id=report.id
        )