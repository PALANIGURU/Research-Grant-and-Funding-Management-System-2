"""
Models for the grants app.
"""
from django.db import models
from django.conf import settings
from django.utils import timezone
from core.mixins import TimeStampedModel
from core.utils import generate_reference_number


class GrantStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    OPEN = 'OPEN', 'Open (Accepting Proposals)'
    CLOSED = 'CLOSED', 'Closed'
    AWARDED = 'AWARDED', 'Awarded'
    COMPLETED = 'COMPLETED', 'Completed'
    CANCELLED = 'CANCELLED', 'Cancelled'


class FundingAgency(TimeStampedModel):
    """Represents a funding agency or organization."""
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)
    contact_email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Funding Agency'
        verbose_name_plural = 'Funding Agencies'
        ordering = ['name']

    def __str__(self):
        return self.name


class GrantCategory(TimeStampedModel):
    """Represents categories of grants (e.g., Health, Tech, Social)."""
    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Grant Category'
        verbose_name_plural = 'Grant Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Grant(TimeStampedModel):
    """Represents a grant opportunity available for application."""
    title = models.CharField(max_length=500)
    reference_number = models.CharField(max_length=50, unique=True, blank=True)
    description = models.TextField()
    funding_agency = models.ForeignKey(
        FundingAgency,
        on_delete=models.PROTECT,
        related_name='grants',
    )
    category = models.ForeignKey(
        GrantCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='grants',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_grants',
    )
    total_amount = models.DecimalField(max_digits=15, decimal_places=2)
    application_deadline = models.DateTimeField()
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=GrantStatus.choices,
        default=GrantStatus.DRAFT,
        db_index=True,
    )
    eligibility_criteria = models.TextField(blank=True)
    required_documents = models.TextField(
        blank=True,
        help_text='Comma-separated list of required document types',
    )
    max_proposals_per_researcher = models.PositiveIntegerField(default=1)

    class Meta:
        verbose_name = 'Grant'
        verbose_name_plural = 'Grants'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.reference_number or 'TEMP'} - {self.title}"

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new and not self.reference_number:
            self.reference_number = generate_reference_number('GRT', self.pk)
            super().save(update_fields=['reference_number'])

    @property
    def is_open(self):
        """Check if grant is active and accepts proposals."""
        return (
            self.status == GrantStatus.OPEN
            and self.application_deadline > timezone.now()
        )

    @property
    def days_remaining(self):
        """Calculate days remaining to apply or complete."""
        today = timezone.now().date()
        if self.end_date < today:
            return 0
        return (self.end_date - today).days
