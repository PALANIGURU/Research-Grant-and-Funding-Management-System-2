"""
Services for the notifications app.
"""
import logging
from django.utils import timezone
from .models import Notification, NotificationType

logger = logging.getLogger('grants_system')


class NotificationService:
    """Service layer for dispatching and managing in-app notifications."""

    @staticmethod
    def send_notification(recipient, title, message, notification_type=NotificationType.SYSTEM, link='', related_object_type='', related_object_id=''):
        """Send a single in-app notification."""
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
        return notification

    @staticmethod
    def send_bulk_notification(recipients, title, message, notification_type=NotificationType.SYSTEM, link=''):
        """Send in-app notifications to multiple users in bulk."""
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
        return created

    @staticmethod
    def notify_proposal_submitted(proposal):
        """Notify Grant Managers when a proposal is submitted."""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        managers = User.objects.filter(role='GRANT_MANAGER', is_active=True)
        
        title = f"New Proposal Submitted: {proposal.reference_number}"
        message = f"Researcher {proposal.submitted_by.get_full_name()} submitted a proposal titled '{proposal.title}'."
        link = f"/proposals/{proposal.id}"

        NotificationService.send_bulk_notification(
            recipients=managers,
            title=title,
            message=message,
            notification_type=NotificationType.PROPOSAL_SUBMITTED,
            link=link
        )

    @staticmethod
    def notify_proposal_approved(proposal):
        """Notify the researcher when their proposal is approved."""
        title = f"Proposal Approved! {proposal.reference_number}"
        message = f"Congratulations! Your proposal '{proposal.title}' has been approved."
        link = f"/proposals/{proposal.id}"

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
        """Notify the researcher when their proposal is rejected."""
        title = f"Proposal Update: {proposal.reference_number}"
        message = f"Your proposal '{proposal.title}' was reviewed and rejected. Reason: {proposal.rejection_reason}"
        link = f"/proposals/{proposal.id}"

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
    def notify_grant_opened(grant):
        """Notify researchers when a new grant opportunity is published."""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        researchers = User.objects.filter(role='RESEARCHER', is_active=True)

        title = f"New Grant Opportunity: {grant.reference_number}"
        message = f"A new grant '{grant.title}' is accepting proposals. Apply before {grant.application_deadline.strftime('%Y-%m-%d')}."
        link = f"/grants/{grant.id}"

        NotificationService.send_bulk_notification(
            recipients=researchers,
            title=title,
            message=message,
            notification_type=NotificationType.GRANT_OPENED,
            link=link
        )

    @staticmethod
    def mark_read(notification):
        """Mark notification as read."""
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save(update_fields=['is_read', 'read_at'])
        return notification
