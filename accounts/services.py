"""
Business logic services for the accounts app.
"""
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger('grants_system')
User = get_user_model()


class UserService:
    """Service class for user-related business logic."""

    @staticmethod
    def get_users_by_role(role):
        """Get all active users with a specific role."""
        return User.objects.filter(role=role, is_active=True)

    @staticmethod
    def deactivate_user(user):
        """Deactivate a user account."""
        user.is_active = False
        user.save(update_fields=['is_active'])
        logger.info(f"User deactivated: {user.email}")
        return user

    @staticmethod
    def activate_user(user):
        """Activate a user account."""
        user.is_active = True
        user.save(update_fields=['is_active'])
        logger.info(f"User activated: {user.email}")
        return user

    @staticmethod
    def change_user_role(user, new_role):
        """Change a user's role."""
        old_role = user.role
        user.role = new_role
        user.save(update_fields=['role'])
        logger.info(
            f"User {user.email} role changed from {old_role} to {new_role}"
        )
        return user

    @staticmethod
    def get_dashboard_stats():
        """Get user statistics for the admin dashboard."""
        from django.db.models import Count
        total = User.objects.count()
        active = User.objects.filter(is_active=True).count()
        by_role = dict(
            User.objects.values_list('role')
            .annotate(count=Count('id'))
            .values_list('role', 'count')
        )
        return {
            'total_users': total,
            'active_users': active,
            'inactive_users': total - active,
            'by_role': by_role,
        }
