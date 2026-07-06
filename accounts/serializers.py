"""
Serializers for user registration, authentication, and profile management.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import UserRole

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for public self-registration.

    Public sign-up is for external Clients only. Staff roles (Admin, Grant
    Manager, Reviewer, Finance Officer, Researcher) are created internally
    by an Administrator via the User Management screen, never through this
    public endpoint. The `role` field is intentionally NOT accepted here —
    any role value submitted in the request is ignored.
    """
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'},
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
    )

    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'password',
            'password_confirm', 'phone', 'department', 'institution',
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })
        try:
            validate_password(attrs['password'])
        except ValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})
        return attrs

    def create(self, validated_data):
        validated_data['role'] = UserRole.CLIENT
        return User.objects.create_user(**validated_data)


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for viewing and updating user profiles."""
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'phone', 'department', 'institution', 'bio',
            'profile_picture', 'email_verified', 'date_joined',
            'last_login', 'is_superuser',
        ]
        read_only_fields = [
            'id', 'email', 'role', 'email_verified',
            'date_joined', 'last_login', 'is_superuser',
        ]

    def get_full_name(self, obj):
        return obj.get_full_name()


class UserListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing users."""
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'department', 'institution', 'is_active']

    def get_full_name(self, obj):
        return obj.get_full_name()


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""
    old_password = serializers.CharField(required=True, style={'input_type': 'password'})
    new_password = serializers.CharField(required=True, min_length=8, style={'input_type': 'password'})
    new_password_confirm = serializers.CharField(required=True, style={'input_type': 'password'})

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'New passwords do not match.'
            })
        try:
            validate_password(attrs['new_password'])
        except ValidationError as e:
            raise serializers.ValidationError({'new_password': list(e.messages)})
        return attrs


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin user management (can modify roles, active status)."""
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'phone', 'department', 'institution', 'bio',
            'is_active', 'email_verified', 'date_joined', 'last_login',
        ]
        read_only_fields = ['id', 'email', 'date_joined', 'last_login']

    def get_full_name(self, obj):
        return obj.get_full_name()
class AdminCreateUserSerializer(serializers.ModelSerializer):
    """
    Serializer used by Administrators to create internal staff accounts
    (Admin, Grant Manager, Reviewer, Finance Officer, Researcher) from the
    User Management screen. Unlike public registration, any role may be
    assigned here since the request is already gated behind IsAdmin.
    """
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'},
    )

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'password',
            'role', 'phone', 'department', 'institution',
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'role': {'required': True},
        }

    def validate_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)