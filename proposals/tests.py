"""
Unit and integration tests for the proposals app.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from core.exceptions import BusinessLogicError
from grants.models import FundingAgency, Grant, GrantStatus
from .models import Proposal, ProposalReview, ProposalStatus, ReviewRecommendation
from .services import ProposalService

User = get_user_model()


class ProposalModelTests(TestCase):

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
            application_deadline=timezone.now() + timedelta(days=30),
            start_date=timezone.now().date() + timedelta(days=40),
            end_date=timezone.now().date() + timedelta(days=365),
            status=GrantStatus.OPEN  # Open so proposals can be created
        )

    def test_proposal_creation_and_ref(self):
        """Test proposal model initialization and ref generation."""
        proposal = Proposal.objects.create(
            grant=self.grant,
            submitted_by=self.researcher,
            title='Deep Learning for Healthcare',
            abstract='An abstract description',
            methodology='The proposed methodology',
            budget_requested=50000.00,
            duration_months=12
        )

        self.assertIsNotNone(proposal.reference_number)
        self.assertTrue(proposal.reference_number.startswith('PRP-'))
        self.assertEqual(proposal.status, ProposalStatus.DRAFT)

    def test_proposal_submission_workflow(self):
        """Test submission status validation transitions."""
        proposal = Proposal.objects.create(
            grant=self.grant,
            submitted_by=self.researcher,
            title='Deep Learning for Healthcare',
            abstract='An abstract description',
            methodology='The proposed methodology',
            budget_requested=50000.00,
            duration_months=12
        )

        # Submit (valid)
        ProposalService.submit_proposal(proposal, self.researcher)
        self.assertEqual(proposal.status, ProposalStatus.SUBMITTED)
        self.assertIsNotNone(proposal.submitted_at)

        # Transition SUBMITTED -> UNDER_REVIEW
        ProposalService.transition_status(proposal, ProposalStatus.UNDER_REVIEW, self.manager)
        self.assertEqual(proposal.status, ProposalStatus.UNDER_REVIEW)

        # Reject without explanation should fail
        with self.assertRaises(BusinessLogicError):
            ProposalService.transition_status(proposal, ProposalStatus.REJECTED, self.manager)
            
        # Reject with explanation should pass
        ProposalService.transition_status(
            proposal, ProposalStatus.REJECTED, self.manager, rejection_reason='Budget too high'
        )
        self.assertEqual(proposal.status, ProposalStatus.REJECTED)
        self.assertEqual(proposal.rejection_reason, 'Budget too high')
