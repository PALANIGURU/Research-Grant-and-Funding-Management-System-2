"""
URL routing for the contact_messages app.
"""
from rest_framework.routers import DefaultRouter
from .views import ContactMessageViewSet

router = DefaultRouter()
router.register(r'messages', ContactMessageViewSet, basename='contact-message')

urlpatterns = router.urls