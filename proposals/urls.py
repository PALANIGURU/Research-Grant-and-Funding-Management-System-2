"""
URL configuration for the proposals app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProposalViewSet

router = DefaultRouter()
router.register(r'submissions', ProposalViewSet, basename='proposal')

urlpatterns = [
    path('', include(router.urls)),
]
