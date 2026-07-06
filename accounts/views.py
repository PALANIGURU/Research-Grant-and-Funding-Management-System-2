"""
Views for user authentication and profile management.
"""
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .serializers import (
    UserRegistrationSerializer,
    UserProfileSerializer,
    UserListSerializer,
    ChangePasswordSerializer,
    AdminUserSerializer,
    AdminCreateUserSerializer,
)
from .permissions import IsAdmin

User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    """
    Register a new user account.
    
    POST /api/auth/register/
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                'success': True,
                'message': 'Registration successful.',
                'data': {
                    'id': str(user.pk),
                    'email': user.email,
                    'full_name': user.get_full_name(),
                    'role': user.role,
                }
            },
            status=status.HTTP_201_CREATED,
        )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update the authenticated user's profile.
    
    GET /api/auth/profile/
    PATCH /api/auth/profile/
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        serializer = self.get_serializer(request.user)
        return Response({'success': True, 'data': serializer.data})

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        serializer = self.get_serializer(
            request.user, data=request.data, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'success': True,
            'message': 'Profile updated successfully.',
            'data': serializer.data,
        })


class ChangePasswordView(generics.UpdateAPIView):
    """
    Change the authenticated user's password.
    
    PUT /api/auth/change-password/
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()

        return Response({
            'success': True,
            'message': 'Password changed successfully.',
        })


class AdminUserViewSet(viewsets.ModelViewSet):
    """
    Admin-only viewset for managing all users.
    
    GET    /api/auth/users/         - List all users
    GET    /api/auth/users/{id}/    - Retrieve a user
    PATCH  /api/auth/users/{id}/    - Update a user (role, active status, etc.)
    DELETE /api/auth/users/{id}/    - Deactivate a user
    """
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_serializer_class(self):
        if self.action == 'create':
            return AdminCreateUserSerializer
        return super().get_serializer_class()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                'success': True,
                'message': f'Staff account created for {user.email}.',
                'data': AdminUserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['role', 'is_active', 'department']
    search_fields = ['email', 'first_name', 'last_name', 'department', 'institution']
    ordering_fields = ['date_joined', 'email', 'first_name', 'role']
    ordering = ['-date_joined']

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = UserListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = UserListSerializer(queryset, many=True)
        return Response({'success': True, 'data': serializer.data})

    def destroy(self, request, *args, **kwargs):
        """Soft-delete: deactivate user instead of deleting."""
        user = self.get_object()
        user.is_active = False
        user.save(update_fields=['is_active'])
        return Response({
            'success': True,
            'message': f'User {user.email} has been deactivated.',
        })

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Reactivate a deactivated user."""
        user = self.get_object()
        user.is_active = True
        user.save(update_fields=['is_active'])
        return Response({
            'success': True,
            'message': f'User {user.email} has been activated.',
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get user statistics by role."""
        from django.db.models import Count
        role_stats = (
            User.objects.values('role')
            .annotate(count=Count('id'))
            .order_by('role')
        )
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()

        return Response({
            'success': True,
            'data': {
                'total_users': total_users,
                'active_users': active_users,
                'inactive_users': total_users - active_users,
                'by_role': {item['role']: item['count'] for item in role_stats},
            }
        })
