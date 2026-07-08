"""
Custom User model and Profile for the Research Grant & Funding Management System.
Uses email as the primary login field with role-based access control.
"""
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.core.validators import RegexValidator


class UserRole(models.TextChoices):
    """User roles for role-based access control."""
    ADMIN = 'ADMIN', 'Administrator'
    GRANT_MANAGER = 'GRANT_MANAGER', 'Grant Manager'
    REVIEWER = 'REVIEWER', 'Reviewer'
    RESEARCHER = 'RESEARCHER', 'Researcher / Principal Investigator'
    FINANCE_OFFICER = 'FINANCE_OFFICER', 'Finance Officer'
    CLIENT = 'CLIENT', 'Client'


class CustomUserManager(BaseUserManager):
    """Custom user manager that uses email as the unique identifier."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        extra_fields.setdefault('role', UserRole.RESEARCHER)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', UserRole.ADMIN)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


phone_validator = RegexValidator(
    regex=r'^(\+91)?[6-9]\d{9}$',
    message="Phone number must be a 10-digit number starting with 6, 7, 8, or 9 (optionally prefixed with +91)."
)


class CustomUser(AbstractUser):
    """
    Custom User model with email-based authentication and role-based access control.
    """
    username = None  # Remove username field
    email = models.EmailField('email address', unique=True, db_index=True)
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.RESEARCHER,
        db_index=True,
    )
    phone = models.CharField(
        max_length=17,
        validators=[phone_validator],
        blank=True,
        null=True,
    )
    department = models.CharField(max_length=150, blank=True)
    institution = models.CharField(max_length=250, blank=True)
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        blank=True,
        null=True,
    )

    # Tracking fields
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    email_verified = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    @property
    def is_admin(self):
        return self.role == UserRole.ADMIN

    @property
    def is_grant_manager(self):
        return self.role == UserRole.GRANT_MANAGER

    @property
    def is_reviewer(self):
        return self.role == UserRole.REVIEWER

    @property
    def is_researcher(self):
        return self.role == UserRole.RESEARCHER

    @property
    def is_finance_officer(self):
        return self.role == UserRole.FINANCE_OFFICER
