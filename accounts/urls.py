"""
URL configuration for the accounts app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    UserRegistrationView,
    UserProfileView,
    ChangePasswordView,
    AdminUserViewSet,
)

router = DefaultRouter()
router.register(r'users', AdminUserViewSet, basename='user')

urlpatterns = [
    # Authentication endpoints
    path('register/', UserRegistrationView.as_view(), name='auth-register'),
    path('login/', TokenObtainPairView.as_view(), name='auth-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # Profile endpoints
    path('profile/', UserProfileView.as_view(), name='auth-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='auth-change-password'),

    # Admin user management
    path('', include(router.urls)),
]
