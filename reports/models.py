"""
Models for the reports app.
"""
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MaxValueValidator
from core.mixins import TimeStampedModel
from core.utils import generate_reference_number


class MilestoneStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    COMPLETED = 'COMPLETED', 'Completed'
    OVERDUE = 'OVERDUE', 'Overdue'


class ReportStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    SUBMITTED = 'SUBMITTED', 'Submitted'
    REVIEWED = 'REVIEWED', 'Reviewed'
    APPROVED = 'APPROVED', 'Approved'


class Milestone(TimeStampedModel):
    """Specific goals/milestones associated with a grant opportunity."""
    grant = models.ForeignKey(
        'grants.Grant',
        on_delete=models.CASCADE,
        related_name='milestones',
    )
    title = models.CharField(max_length=300)
    description = models.TextField()
    due_date = models.DateField()
    completion_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=MilestoneStatus.choices,
        default=MilestoneStatus.PENDING,
        db_index=True,
    )
    deliverables = models.TextField(blank=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_milestones',
    )
    completion_percentage = models.PositiveIntegerField(
        default=0,
        validators=[MaxValueValidator(100)],
    )

    class Meta:
        verbose_name = 'Milestone'
        verbose_name_plural = 'Milestones'
        ordering = ['due_date']

    def __str__(self):
        return f"{self.grant.reference_number or 'TEMP'} - {self.title}"

    @property
    def is_overdue(self):
        """Check if milestone is currently past its deadline."""
        return (
            self.status != MilestoneStatus.COMPLETED
            and self.due_date < timezone.now().date()
        )


class ProgressReport(TimeStampedModel):
    """Progress report submitted by researchers periodically."""
    grant = models.ForeignKey(
        'grants.Grant',
        on_delete=models.CASCADE,
        related_name='progress_reports',
    )
    milestone = models.ForeignKey(
        Milestone,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='progress_reports',
    )
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='submitted_progress_reports',
    )
    report_number = models.CharField(max_length=50, unique=True, blank=True)
    period_start = models.DateField()
    period_end = models.DateField()
    summary = models.TextField()
    activities_completed = models.TextField()
    challenges = models.TextField(blank=True)
    next_steps = models.TextField(blank=True)
    expenditure_summary = models.DecimalField(max_digits=15, decimal_places=2, default=0.0)
    status = models.CharField(
        max_length=20,
        choices=ReportStatus.choices,
        default=ReportStatus.DRAFT,
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_progress_reports',
    )
    review_comments = models.TextField(blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Progress Report'
        verbose_name_plural = 'Progress Reports'
        ordering = ['-created_at']

    def __str__(self):
        return f"Progress Report {self.report_number or 'TEMP'} for {self.grant.title}"

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new and not self.report_number:
            self.report_number = generate_reference_number('RPT', self.pk)
            super().save(update_fields=['report_number'])


class FinalReport(TimeStampedModel):
    """Final summary report submitted upon grant completion."""
    grant = models.OneToOneField(
        'grants.Grant',
        on_delete=models.CASCADE,
        related_name='final_report',
    )
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='submitted_final_reports',
    )
    report_number = models.CharField(max_length=50, unique=True, blank=True)
    summary = models.TextField()
    objectives_achieved = models.TextField()
    outcomes = models.TextField()
    publications = models.TextField(
        blank=True,
        help_text='List of academic publications/outcomes resulting from the research',
    )
    financial_summary = models.TextField()
    total_expenditure = models.DecimalField(max_digits=15, decimal_places=2)
    lessons_learned = models.TextField(blank=True)
    recommendations = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=ReportStatus.choices,
        default=ReportStatus.DRAFT,
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_final_reports',
    )
    review_comments = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Final Report'
        verbose_name_plural = 'Final Reports'

    def __str__(self):
        return f"Final Report {self.report_number or 'TEMP'} for {self.grant.title}"

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new and not self.report_number:
            self.report_number = generate_reference_number('FNL', self.pk)
            super().save(update_fields=['report_number'])
