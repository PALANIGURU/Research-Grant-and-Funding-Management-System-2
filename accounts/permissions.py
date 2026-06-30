"""
Role-based permission classes for the Research Grant & Funding Management System.
"""
from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allows access only to Admin users."""
    message = 'Admin access required.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'ADMIN'
        )


class IsGrantManager(BasePermission):
    """Allows access only to Grant Manager users."""
    message = 'Grant Manager access required.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'GRANT_MANAGER'
        )


class IsReviewer(BasePermission):
    """Allows access only to Reviewer users."""
    message = 'Reviewer access required.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'REVIEWER'
        )


class IsResearcher(BasePermission):
    """Allows access only to Researcher / PI users."""
    message = 'Researcher access required.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'RESEARCHER'
        )


class IsFinanceOfficer(BasePermission):
    """Allows access only to Finance Officer users."""
    message = 'Finance Officer access required.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'FINANCE_OFFICER'
        )


class IsAdminOrGrantManager(BasePermission):
    """Allows access to Admin or Grant Manager users."""
    message = 'Admin or Grant Manager access required.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('ADMIN', 'GRANT_MANAGER')
        )


class IsAdminOrFinanceOfficer(BasePermission):
    """Allows access to Admin or Finance Officer users."""
    message = 'Admin or Finance Officer access required.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('ADMIN', 'FINANCE_OFFICER')
        )


class IsOwnerOrAdmin(BasePermission):
    """
    Object-level permission: allows access if the user is the owner of the
    object or an Admin.
    Expects the object to have a 'submitted_by', 'created_by', or 'user' field.
    """
    message = 'You do not have permission to access this resource.'

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN':
            return True
        # Check various ownership fields
        owner_fields = ['submitted_by', 'created_by', 'user', 'recipient']
        for field in owner_fields:
            owner = getattr(obj, field, None)
            if owner is not None:
                return owner == request.user
        return False
