"""
Unit and integration tests for the notifications app.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Notification, NotificationType
from .services import NotificationService

User = get_user_model()


class NotificationTests(TestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(
            email='user1@example.com',
            password='Password123!',
            first_name='John',
            last_name='Doe',
            role='RESEARCHER'
        )
        self.user2 = User.objects.create_user(
            email='user2@example.com',
            password='Password123!',
            first_name='Jane',
            last_name='Doe',
            role='RESEARCHER'
        )

    def test_send_single_notification(self):
        """Test sending a single notification."""
        notify = NotificationService.send_notification(
            recipient=self.user1,
            title='Test Title',
            message='Test message content',
            notification_type=NotificationType.SYSTEM
        )

        self.assertEqual(notify.recipient, self.user1)
        self.assertEqual(notify.title, 'Test Title')
        self.assertFalse(notify.is_read)

    def test_send_bulk_notifications(self):
        """Test bulk notification dispatch."""
        NotificationService.send_bulk_notification(
            recipients=[self.user1, self.user2],
            title='System Updates',
            message='Server undergoes maintenance tonight.'
        )

        self.assertEqual(Notification.objects.filter(title='System Updates').count(), 2)

    def test_mark_as_read(self):
        """Test marking read status updates."""
        notify = NotificationService.send_notification(
            recipient=self.user1,
            title='System Alert',
            message='System alert text.'
        )

        NotificationService.mark_read(notify)
        self.assertTrue(notify.is_read)
        self.assertIsNotNone(notify.read_at)
