"""
Views for the contact_messages app.
"""
from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsAdmin
from .models import ContactMessage
from .serializers import ContactMessageCreateSerializer, ContactMessageListSerializer


class ContactMessageViewSet(viewsets.ModelViewSet):
    """
    - POST /api/contact/messages/   -> anyone (public form submission)
    - GET  /api/contact/messages/   -> Admin only (view submitted messages)
    - PATCH .../{id}/               -> Admin only (mark as read)
    """
    queryset = ContactMessage.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return ContactMessageCreateSerializer
        return ContactMessageListSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdmin()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'success': True, 'message': 'Your message has been received. We will get back to you shortly.'},
            status=status.HTTP_201_CREATED,
        )