"""
Unit and integration tests for the grants app.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from core.exceptions import BusinessLogicError
from .models import FundingAgency, GrantCategory, Grant, GrantStatus
from .services import GrantService

User = get_user_model()


class GrantModelTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email='manager@example.com',
            password='Password123!',
            first_name='Grant',
            last_name='Manager',
            role='GRANT_MANAGER'
        )
        self.agency = FundingAgency.objects.create(
            name='National Science Foundation',
            contact_email='nsf@example.com'
        )
        self.category = GrantCategory.objects.create(
            name='Quantum Computing'
        )

    def test_grant_creation_and_ref_number(self):
        """Test creating a grant generates a unique reference number."""
        grant = Grant.objects.create(
            title='Quantum Algorithms Research',
            description='Research on quantum algorithms',
            funding_agency=self.agency,
            category=self.category,
            created_by=self.user,
            total_amount=500000.00,
            application_deadline=timezone.now() + timedelta(days=30),
            start_date=timezone.now().date() + timedelta(days=40),
            end_date=timezone.now().date() + timedelta(days=365),
            status=GrantStatus.DRAFT
        )

        self.assertIsNotNone(grant.reference_number)
        self.assertTrue(grant.reference_number.startswith('GRT-'))
        self.assertEqual(grant.status, GrantStatus.DRAFT)

    def test_status_transitions(self):
        """Test transitioning statuses through GrantService."""
        grant = Grant.objects.create(
            title='Quantum Algorithms Research',
            description='Research on quantum algorithms',
            funding_agency=self.agency,
            category=self.category,
            created_by=self.user,
            total_amount=500000.00,
            application_deadline=timezone.now() + timedelta(days=30),
            start_date=timezone.now().date() + timedelta(days=40),
            end_date=timezone.now().date() + timedelta(days=365),
            status=GrantStatus.DRAFT
        )

        # Transition DRAFT -> OPEN (valid)
        GrantService.transition_status(grant, GrantStatus.OPEN, self.user)
        self.assertEqual(grant.status, GrantStatus.OPEN)

        # Transition OPEN -> COMPLETED (invalid, must go CLOSED first)
        with self.assertRaises(BusinessLogicError):
            GrantService.transition_status(grant, GrantStatus.COMPLETED, self.user)

        # Transition OPEN -> CLOSED (valid)
        GrantService.transition_status(grant, GrantStatus.CLOSED, self.user)
        self.assertEqual(grant.status, GrantStatus.CLOSED)
