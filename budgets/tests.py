"""
Unit and integration tests for the budgets app.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from core.exceptions import BusinessLogicError
from grants.models import FundingAgency, Grant, GrantStatus
from .models import Budget, BudgetItem, BudgetCategory, BudgetStatus, Disbursement, DisbursementStatus, Expense
from .services import BudgetService

User = get_user_model()


class BudgetModelAndServicesTests(TestCase):

    def setUp(self):
        self.finance_officer = User.objects.create_user(
            email='finance@example.com',
            password='Password123!',
            first_name='Finance',
            last_name='Officer',
            role='FINANCE_OFFICER'
        )
        self.researcher = User.objects.create_user(
            email='researcher@example.com',
            password='Password123!',
            first_name='Principal',
            last_name='Investigator',
            role='RESEARCHER'
        )
        self.agency = FundingAgency.objects.create(name='NSF')
        self.grant = Grant.objects.create(
            title='AI Research Opportunity',
            description='Funding for AI research',
            funding_agency=self.agency,
            created_by=self.finance_officer,
            total_amount=100000.00,
            application_deadline=timezone.now() - timedelta(days=5),
            start_date=timezone.now().date() + timedelta(days=1),
            end_date=timezone.now().date() + timedelta(days=365),
            status=GrantStatus.AWARDED  # Must be awarded to link a budget
        )

    def test_budget_initialization(self):
        """Test standard budget creation flow."""
        budget = BudgetService.create_budget_for_grant(
            grant=self.grant,
            total_allocated=100000.00,
            user=self.finance_officer
        )
        self.assertEqual(budget.total_allocated, 100000.00)
        self.assertEqual(budget.status, BudgetStatus.DRAFT)

    def test_expense_recording_with_insufficient_funds(self):
        """Test that expenses exceeding category allocation fail validation."""
        budget = BudgetService.create_budget_for_grant(
            grant=self.grant,
            total_allocated=100000.00,
            user=self.finance_officer
        )
        budget.status = BudgetStatus.ACTIVE
        budget.save()

        # Add line item with 10k allocation
        item = BudgetItem.objects.create(
            budget=budget,
            category=BudgetCategory.TRAVEL,
            description='Conference Travel',
            amount_allocated=10000.00
        )

        # Attempt to record expense of 12k (should raise exception)
        with self.assertRaises(BusinessLogicError):
            BudgetService.record_expense(
                budget_item=item,
                amount=12000.00,
                description='Flights to Europe',
                user=self.researcher
            )

        # Record expense of 8k (valid)
        expense = BudgetService.record_expense(
            budget_item=item,
            amount=8000.00,
            description='Flights to Europe',
            user=self.researcher
        )
        self.assertEqual(expense.amount, 8000.00)
        self.assertEqual(item.amount_spent, 8000.00)
        self.assertEqual(budget.total_spent, 8000.00)

    def test_disbursement_approval_validation(self):
        """Test disbursement approvals do not exceed total budget allocation."""
        budget = BudgetService.create_budget_for_grant(
            grant=self.grant,
            total_allocated=100000.00,
            user=self.finance_officer
        )
        budget.status = BudgetStatus.ACTIVE
        budget.save()

        # Create disbursement of 120k (exceeds 100k budget)
        disbursement = Disbursement.objects.create(
            budget=budget,
            amount=120000.00,
            disbursement_date=timezone.now().date(),
            description='First payment release',
            requested_by=self.researcher,
            status=DisbursementStatus.PENDING
        )

        # Approving should fail
        with self.assertRaises(BusinessLogicError):
            BudgetService.approve_disbursement(disbursement, self.finance_officer)
