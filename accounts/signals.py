"""
Signals for the accounts app.
"""
import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

logger = logging.getLogger('grants_system')

User = get_user_model()


@receiver(post_save, sender=User)
def log_user_creation(sender, instance, created, **kwargs):
    """Log when a new user is created."""
    if created:
        logger.info(
            f"New user registered: {instance.email} (role: {instance.role})"
        )
