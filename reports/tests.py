"""
Unit and integration tests for the reports app.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from core.exceptions import BusinessLogicError
from grants.models import FundingAgency, Grant, GrantStatus
from .models import Milestone, MilestoneStatus, ProgressReport, ReportStatus
from .services import ReportService

User = get_user_model()


class ReportsModelAndServicesTests(TestCase):

    def setUp(self):
        self.manager = User.objects.create_user(
            email='manager@example.com',
            password='Password123!',
            first_name='Grant',
            last_name='Manager',
            role='GRANT_MANAGER'
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
            created_by=self.manager,
            total_amount=100000.00,
            application_deadline=timezone.now() - timedelta(days=5),
            start_date=timezone.now().date() + timedelta(days=1),
            end_date=timezone.now().date() + timedelta(days=365),
            status=GrantStatus.AWARDED
        )

    def test_milestone_overdue_service_sweep(self):
        """Test that past due milestones are marked OVERDUE by sweep service."""
        # Milestone with due date in the past
        past_milestone = Milestone.objects.create(
            grant=self.grant,
            title='Deliver Initial Prototype',
            description='Details...',
            due_date=timezone.now().date() - timedelta(days=1),
            status=MilestoneStatus.PENDING
        )

        # Milestone with due date in the future
        future_milestone = Milestone.objects.create(
            grant=self.grant,
            title='Deliver Final Prototype',
            description='Details...',
            due_date=timezone.now().date() + timedelta(days=5),
            status=MilestoneStatus.PENDING
        )

        # Run sweep
        count = ReportService.check_overdue_milestones()
        self.assertEqual(count, 1)
        
        past_milestone.refresh_from_db()
        future_milestone.refresh_from_db()

        self.assertEqual(past_milestone.status, MilestoneStatus.OVERDUE)
        self.assertEqual(future_milestone.status, MilestoneStatus.PENDING)

    def test_progress_report_date_period_validation(self):
        """Test that progress report submissions validation handles period start/end dates."""
        report = ProgressReport.objects.create(
            grant=self.grant,
            submitted_by=self.researcher,
            period_start=timezone.now().date(),
            period_end=timezone.now().date() + timedelta(days=30),
            summary='Working summary',
            activities_completed='Completed code structure',
            status=ReportStatus.DRAFT
        )

        # Submit progress report (valid)
        ReportService.submit_progress_report(report, self.researcher)
        self.assertEqual(report.status, ReportStatus.SUBMITTED)
        self.assertIsNotNone(report.submitted_at)
