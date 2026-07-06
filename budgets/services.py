"""
Services for the budgets app.
"""
import logging
from django.utils import timezone
from django.db.models import Sum
from core.exceptions import BusinessLogicError
from .models import Budget, BudgetItem, Disbursement, DisbursementStatus, Expense, BudgetStatus
from notifications.services import NotificationService

logger = logging.getLogger('grants_system')


class BudgetService:
    """Service layer managing financials, disbursements, and expenses."""

    @staticmethod
    def create_budget_for_grant(grant, total_allocated, user):
        """Initialize a grant budget."""
        if Budget.objects.filter(grant=grant).exists():
            raise BusinessLogicError("A budget already exists for this grant opportunity.")

        budget = Budget.objects.create(
            grant=grant,
            total_allocated=total_allocated,
            status=BudgetStatus.DRAFT,
            approved_by=user,
            approved_at=timezone.now()
        )
        logger.info(f"Budget for grant {grant.reference_number} initialized by {user.email}")
        return budget

    @staticmethod
    def record_expense(budget_item, amount, description, user, expense_date=None, receipt=None):
        """Record an expense against a line item."""
        budget = budget_item.budget

        if budget.status != BudgetStatus.ACTIVE:
            raise BusinessLogicError("Expenses can only be recorded against active budgets.")

        if amount <= 0:
            raise BusinessLogicError("Expense amount must be greater than zero.")

        # Check line item threshold
        if budget_item.remaining < amount:
            raise BusinessLogicError(
                f"Insufficient funds in {budget_item.category}. "
                f"Remaining: {budget_item.remaining}, Requested: {amount}"
            )

        expense = Expense.objects.create(
            budget=budget,
            budget_item=budget_item,
            description=description,
            amount=amount,
            expense_date=expense_date or timezone.now().date(),
            receipt=receipt,
            recorded_by=user
        )

        # Update spent counts (assume auto-approved for simplicity, or manage approval workflow)
        budget_item.amount_spent += amount
        budget_item.save(update_fields=['amount_spent'])

        budget.total_spent += amount
        budget.save(update_fields=['total_spent'])

        logger.info(
            f"Expense of {amount} recorded against {budget_item.category} "
            f"for grant {budget.grant.reference_number} by {user.email}"
        )
        return expense

    @staticmethod
    def approve_disbursement(disbursement, user):
        """Approve a pending release of funds."""
        if disbursement.status != DisbursementStatus.PENDING:
            raise BusinessLogicError("Disbursement is not in a pending state.")

        budget = disbursement.budget

        # Check total disbursement vs allocated budget
        total_disbursed = Disbursement.objects.filter(
            budget=budget, status=DisbursementStatus.DISBURSED
        ).aggregate(total=Sum('amount'))['total'] or 0.0

        if total_disbursed + float(disbursement.amount) > float(budget.total_allocated):
            raise BusinessLogicError("Disbursement exceeds total allocated budget amount.")

        disbursement.status = DisbursementStatus.APPROVED
        disbursement.approved_by = user
        disbursement.approved_at = timezone.now()
        disbursement.save(update_fields=['status', 'approved_by', 'approved_at'])

        logger.info(
            f"Disbursement {disbursement.reference_number} approved by {user.email}"
        )
        NotificationService.notify_disbursement_approved(disbursement)
        return disbursement

    @staticmethod
    def get_budget_summary(budget):
        """Calculate detailed allocation vs expenditure statistics."""
        items_summary = []
        for item in budget.items.all():
            items_summary.append({
                'category': item.category,
                'allocated': item.amount_allocated,
                'spent': item.amount_spent,
                'remaining': item.remaining,
                'utilization_pct': round((item.amount_spent / item.amount_allocated * 100), 2) if item.amount_allocated > 0 else 0.0
            })

        return {
            'total_allocated': budget.total_allocated,
            'total_spent': budget.total_spent,
            'remaining': budget.remaining_amount,
            'utilization_pct': budget.utilization_percentage,
            'categories': items_summary
        }
