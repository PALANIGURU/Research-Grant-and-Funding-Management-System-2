"""
Models for the proposals app.
"""
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from core.mixins import TimeStampedModel
from core.utils import generate_reference_number


class ProposalStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    SUBMITTED = 'SUBMITTED', 'Submitted'
    UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'
    REVISION_REQUESTED = 'REVISION_REQUESTED', 'Revision Requested'


class ReviewRecommendation(models.TextChoices):
    APPROVE = 'APPROVE', 'Approve'
    REJECT = 'REJECT', 'Reject'
    REVISE = 'REVISE', 'Request Revision'


class Proposal(TimeStampedModel):
    """Represents a researcher's proposal application for a grant."""
    grant = models.ForeignKey(
        'grants.Grant',
        on_delete=models.CASCADE,
        related_name='proposals',
    )
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='proposals',
    )
    title = models.CharField(max_length=500)
    reference_number = models.CharField(max_length=50, unique=True, blank=True)
    abstract = models.TextField()
    methodology = models.TextField()
    expected_outcomes = models.TextField(blank=True)
    budget_requested = models.DecimalField(max_digits=15, decimal_places=2)
    duration_months = models.PositiveIntegerField()
    team_members = models.TextField(
        blank=True,
        help_text='JSON structured list of team members and roles',
    )
    status = models.CharField(
        max_length=30,
        choices=ProposalStatus.choices,
        default=ProposalStatus.DRAFT,
        db_index=True,
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    revision_comments = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Proposal'
        verbose_name_plural = 'Proposals'
        ordering = ['-created_at']
        unique_together = ['grant', 'submitted_by']

    def __str__(self):
        return f"{self.reference_number or 'TEMP'} - {self.title}"

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new and not self.reference_number:
            self.reference_number = generate_reference_number('PRP', self.pk)
            super().save(update_fields=['reference_number'])


class ProposalReview(TimeStampedModel):
    """Represents a score sheet evaluation by a Reviewer."""
    proposal = models.ForeignKey(
        Proposal,
        on_delete=models.CASCADE,
        related_name='reviews',
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='proposal_reviews',
    )
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
    )
    methodology_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    impact_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    feasibility_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    budget_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    comments = models.TextField()
    recommendation = models.CharField(
        max_length=20,
        choices=ReviewRecommendation.choices,
    )
    reviewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Proposal Review'
        verbose_name_plural = 'Proposal Reviews'
        unique_together = ['proposal', 'reviewer']
        ordering = ['-reviewed_at']

    def __str__(self):
        return f"Review for {self.proposal.reference_number} by {self.reviewer.email}"


class DocumentType(models.TextChoices):
    """Category of a proposal's supporting document."""
    CV = 'CV', 'CV / Resume'
    BUDGET_PLAN = 'BUDGET_PLAN', 'Budget Plan'
    RESEARCH_PLAN = 'RESEARCH_PLAN', 'Research Plan'
    ETHICS_APPROVAL = 'ETHICS_APPROVAL', 'Ethics Approval'
    LETTER_OF_SUPPORT = 'LETTER_OF_SUPPORT', 'Letter of Support'
    OTHER = 'OTHER', 'Other'


class ProposalAttachment(TimeStampedModel):
    """Uploaded files attached to a proposal submission."""
    proposal = models.ForeignKey(
        Proposal,
        on_delete=models.CASCADE,
        related_name='attachments',
    )
    file = models.FileField(upload_to='proposal_attachments/%Y/%m/')
    file_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(help_text='File size in bytes')
    document_type = models.CharField(
        max_length=20,
        choices=DocumentType.choices,
        default=DocumentType.OTHER,
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
    )
    description = models.CharField(max_length=500, blank=True)

    class Meta:
        verbose_name = 'Proposal Attachment'
        verbose_name_plural = 'Proposal Attachments'

    def __str__(self):
        return self.file_name
