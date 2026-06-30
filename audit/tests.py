"""
Unit and integration tests for the audit app.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import AuditLog, AuditAction

User = get_user_model()


class AuditMiddlewareTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email='admin@example.com',
            password='AdminPassword123!',
            first_name='Admin',
            last_name='User'
        )
        self.client.force_authenticate(user=self.admin)

    def test_middleware_skips_get_requests(self):
        """Test that read-only GET requests are not logged in AuditLog."""
        # Querying auth stats (which is a GET request)
        self.client.get('/api/auth/users/stats/')
        
        # Check logs count
        self.assertEqual(AuditLog.objects.count(), 0)

    def test_middleware_logs_mutating_requests(self):
        """Test that POST/PUT/PATCH/DELETE API requests create AuditLogs."""
        # Create a new user (via admin endpoint, which is a POST request)
        data = {
            'email': 'newguy@example.com',
            'first_name': 'New',
            'last_name': 'Guy',
            'role': 'RESEARCHER',
            'password': 'Password123!',
            'password_confirm': 'Password123!'
        }
        
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # AuditLog entry should be present
        self.assertEqual(AuditLog.objects.count(), 1)
        log = AuditLog.objects.first()
        self.assertEqual(log.action, AuditAction.CREATE)
        self.assertEqual(log.request_method, 'POST')
        self.assertEqual(log.request_path, '/api/auth/register/')
