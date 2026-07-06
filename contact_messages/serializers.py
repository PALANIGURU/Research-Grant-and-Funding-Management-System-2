"""
Serializers for the contact_messages app.
"""
from rest_framework import serializers
from .models import ContactMessage


class ContactMessageCreateSerializer(serializers.ModelSerializer):
    """Public-facing serializer used when a visitor submits the Contact form."""
    class Meta:
        model = ContactMessage
        fields = ['name', 'email', 'subject', 'message']


class ContactMessageListSerializer(serializers.ModelSerializer):
    """Admin-facing serializer for viewing submitted messages."""
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'is_read', 'created_at']
        read_only_fields = fields