"""
Tests for the accounts app.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class CustomUserModelTests(TestCase):
    """Tests for the CustomUser model."""

    def test_create_user_with_email(self):
        """Test creating a user with email is successful."""
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
        )
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('testpass123'))
        self.assertEqual(user.role, 'RESEARCHER')
        self.assertFalse(user.is_staff)

    def test_create_superuser(self):
        """Test creating a superuser."""
        user = User.objects.create_superuser(
            email='admin@example.com',
            password='adminpass123',
            first_name='Admin',
            last_name='User',
        )
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
        self.assertEqual(user.role, 'ADMIN')

    def test_user_str_representation(self):
        """Test the string representation of a user."""
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='John',
            last_name='Doe',
        )
        self.assertEqual(str(user), 'John Doe (test@example.com)')

    def test_user_role_properties(self):
        """Test role check properties."""
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='GRANT_MANAGER',
        )
        self.assertTrue(user.is_grant_manager)
        self.assertFalse(user.is_admin)
        self.assertFalse(user.is_researcher)

    def test_email_required(self):
        """Test that email is required."""
        with self.assertRaises(ValueError):
            User.objects.create_user(email='', password='testpass123')


class AuthenticationAPITests(TestCase):
    """Tests for authentication API endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/auth/register/'
        self.login_url = '/api/auth/login/'
        self.profile_url = '/api/auth/profile/'

    def test_user_registration(self):
        """Test successful user registration."""
        data = {
            'email': 'newuser@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'StrongPass123!',
            'password_confirm': 'StrongPass123!',
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])

    def test_registration_password_mismatch(self):
        """Test registration fails with mismatched passwords."""
        data = {
            'email': 'newuser@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'StrongPass123!',
            'password_confirm': 'DifferentPass123!',
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_returns_tokens(self):
        """Test that login returns access and refresh tokens."""
        User.objects.create_user(
            email='test@example.com',
            password='testpass123!A',
            first_name='Test',
            last_name='User',
        )
        response = self.client.post(self.login_url, {
            'email': 'test@example.com',
            'password': 'testpass123!A',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_profile_requires_authentication(self):
        """Test that profile endpoint requires authentication."""
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_access_with_token(self):
        """Test accessing profile with valid JWT token."""
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123!A',
            first_name='Test',
            last_name='User',
        )
        # Login to get token
        login_response = self.client.post(self.login_url, {
            'email': 'test@example.com',
            'password': 'testpass123!A',
        })
        token = login_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['email'], 'test@example.com')
