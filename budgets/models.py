"""
Models for the budgets app.
"""
from django.db import models
from django.conf import settings
from core.mixins import TimeStampedModel
from core.utils import generate_reference_number


class BudgetStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    ACTIVE = 'ACTIVE', 'Active'
    FROZEN = 'FROZEN', 'Frozen'
    CLOSED = 'CLOSED', 'Closed'


class BudgetCategory(models.TextChoices):
    PERSONNEL = 'PERSONNEL', 'Personnel'
    EQUIPMENT = 'EQUIPMENT', 'Equipment'
    TRAVEL = 'TRAVEL', 'Travel'
    SUPPLIES = 'SUPPLIES', 'Supplies'
    CONSULTING = 'CONSULTING', 'Consulting'
    OVERHEAD = 'OVERHEAD', 'Overhead'
    OTHER = 'OTHER', 'Other'


class DisbursementStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Approval'
    APPROVED = 'APPROVED', 'Approved (Pending Release)'
    DISBURSED = 'DISBURSED', 'Disbursed'
    REJECTED = 'REJECTED', 'Rejected'


class Budget(TimeStampedModel):
    """Overall budget for an awarded grant."""
    grant = models.OneToOneField(
        'grants.Grant',
        on_delete=models.CASCADE,
        related_name='budget',
    )
    total_allocated = models.DecimalField(max_digits=15, decimal_places=2)
    total_spent = models.DecimalField(max_digits=15, decimal_places=2, default=0.0)
    status = models.CharField(
        max_length=20,
        choices=BudgetStatus.choices,
        default=BudgetStatus.DRAFT,
        db_index=True,
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_budgets',
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Budget'
        verbose_name_plural = 'Budgets'

    def __str__(self):
        return f"Budget for {self.grant.title}"

    @property
    def remaining_amount(self):
        return self.total_allocated - self.total_spent

    @property
    def utilization_percentage(self):
        if self.total_allocated == 0:
            return 0.0
        return round((self.total_spent / self.total_allocated) * 100, 2)


class BudgetItem(TimeStampedModel):
    """Specific line item within a budget."""
    budget = models.ForeignKey(
        Budget,
        on_delete=models.CASCADE,
        related_name='items',
    )
    category = models.CharField(
        max_length=20,
        choices=BudgetCategory.choices,
    )
    description = models.CharField(max_length=500)
    amount_allocated = models.DecimalField(max_digits=15, decimal_places=2)
    amount_spent = models.DecimalField(max_digits=15, decimal_places=2, default=0.0)

    class Meta:
        verbose_name = 'Budget Line Item'
        verbose_name_plural = 'Budget Line Items'

    def __str__(self):
        return f"{self.category}: {self.description}"

    @property
    def remaining(self):
        return self.amount_allocated - self.amount_spent


class Disbursement(TimeStampedModel):
    """Release of funds towards a grant's budget."""
    budget = models.ForeignKey(
        Budget,
        on_delete=models.CASCADE,
        related_name='disbursements',
    )
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    disbursement_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=DisbursementStatus.choices,
        default=DisbursementStatus.PENDING,
        db_index=True,
    )
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='requested_disbursements',
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_disbursements',
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    reference_number = models.CharField(max_length=50, unique=True, blank=True)
    description = models.TextField()
    rejection_reason = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Disbursement'
        verbose_name_plural = 'Disbursements'

    def __str__(self):
        return f"Disbursement {self.reference_number or 'TEMP'} of {self.amount}"

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new and not self.reference_number:
            self.reference_number = generate_reference_number('DSB', self.pk)
            super().save(update_fields=['reference_number'])


class Expense(TimeStampedModel):
    """Specific expense recorded against a budget line item."""
    budget = models.ForeignKey(
        Budget,
        on_delete=models.CASCADE,
        related_name='expenses',
    )
    budget_item = models.ForeignKey(
        BudgetItem,
        on_delete=models.CASCADE,
        related_name='expenses',
    )
    description = models.CharField(max_length=500)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    expense_date = models.DateField()
    receipt = models.FileField(upload_to='expense_receipts/%Y/%m/', blank=True, null=True)
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
    )
    is_approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_expenses',
    )

    class Meta:
        verbose_name = 'Expense'
        verbose_name_plural = 'Expenses'

    def __str__(self):
        return f"Expense of {self.amount} on {self.budget_item.category}"
