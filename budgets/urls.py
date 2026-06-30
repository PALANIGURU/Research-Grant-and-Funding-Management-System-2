"""
URL configuration for the budgets app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BudgetViewSet, DisbursementViewSet

router = DefaultRouter()
router.register(r'financials', BudgetViewSet, basename='budget')
router.register(r'disbursements', DisbursementViewSet, basename='disbursement')

urlpatterns = [
    path('', include(router.urls)),
]
