"""
Models for the contact_messages app — stores messages submitted through the
public-facing "Get in touch" form.
"""
from django.db import models
from core.mixins import TimeStampedModel


class ContactMessage(TimeStampedModel):
    """A message submitted via the public Contact page."""
    name = models.CharField(max_length=150)
    email = models.EmailField()
    subject = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Contact Message'
        verbose_name_plural = 'Contact Messages'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subject} — {self.email}"