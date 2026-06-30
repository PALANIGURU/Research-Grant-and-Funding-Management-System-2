"""
URL routing configuration for the grants app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FundingAgencyViewSet, GrantCategoryViewSet, GrantViewSet

router = DefaultRouter()
router.register(r'agencies', FundingAgencyViewSet, basename='agency')
router.register(r'categories', GrantCategoryViewSet, basename='category')
router.register(r'opportunities', GrantViewSet, basename='grant')

urlpatterns = [
    path('', include(router.urls)),
]
