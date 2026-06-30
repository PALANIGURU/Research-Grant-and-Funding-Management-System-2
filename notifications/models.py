-"""
Models for the notifications app.
"""
from django.db import models
from django.conf import settings
from core.mixins import TimeStampedModel


class NotificationType(models.TextChoices):
    PROPOSAL_SUBMITTED = 'PROPOSAL_SUBMITTED', 'Proposal Submitted'
    PROPOSAL_APPROVED = 'PROPOSAL_APPROVED', 'Proposal Approved'
    PROPOSAL_REJECTED = 'PROPOSAL_REJECTED', 'Proposal Rejected'
    PROPOSAL_REVISION = 'PROPOSAL_REVISION', 'Revision Requested'
    GRANT_OPENED = 'GRANT_OPENED', 'Grant Opportunity Opened'
    GRANT_AWARDED = 'GRANT_AWARDED', 'Grant Awarded'
    GRANT_COMPLETED = 'GRANT_COMPLETED', 'Grant Completed'
    REVIEW_ASSIGNED = 'REVIEW_ASSIGNED', 'Review Assigned'
    REVIEW_COMPLETED = 'REVIEW_COMPLETED', 'Review Completed'
    MILESTONE_DUE = 'MILESTONE_DUE', 'Milestone Due Soon'
    MILESTONE_OVERDUE = 'MILESTONE_OVERDUE', 'Milestone Overdue'
    DISBURSEMENT_APPROVED = 'DISBURSEMENT_APPROVED', 'Disbursement Approved'
    DISBURSEMENT_REJECTED = 'DISBURSEMENT_REJECTED', 'Disbursement Rejected'
    REPORT_SUBMITTED = 'REPORT_SUBMITTED', 'Report Submitted'
    REPORT_REVIEWED = 'REPORT_REVIEWED', 'Report Reviewed'
    SYSTEM = 'SYSTEM', 'System Alert'


class Notification(TimeStampedModel):
    """In-app notifications sent to specific users."""
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    title = models.CharField(max_length=300)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM,
        db_index=True,
    )
    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)
    link = models.CharField(
        max_length=500,
        blank=True,
        help_text='Front-end URL path to navigate to when clicked',
    )
    related_object_type = models.CharField(
        max_length=50,
        blank=True,
        help_text='Model name of the related entity',
    )
    related_object_id = models.CharField(
        max_length=50,
        blank=True,
        help_text='Primary key of the related entity',
    )

    class Meta:
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} -> {self.recipient.email}"
