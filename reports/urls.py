"""
URL configuration for the reports app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MilestoneViewSet, ProgressReportViewSet, FinalReportViewSet

router = DefaultRouter()
router.register(r'milestones', MilestoneViewSet, basename='milestone')
router.register(r'progress', ProgressReportViewSet, basename='progress-report')
router.register(r'final', FinalReportViewSet, basename='final-report')

urlpatterns = [
    path('', include(router.urls)),
]
