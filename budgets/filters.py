"""
Filters for the budgets app.
"""
from django_filters import rest_framework as filters
from .models import Budget, Disbursement, Expense


class BudgetFilter(filters.FilterSet):
    status = filters.CharFilter(field_name='status', lookup_expr='exact')
    grant = filters.UUIDFilter(field_name='grant', lookup_expr='exact')

    class Meta:
        model = Budget
        fields = ['status', 'grant']


class DisbursementFilter(filters.FilterSet):
    status = filters.CharFilter(field_name='status', lookup_expr='exact')
    budget = filters.UUIDFilter(field_name='budget', lookup_expr='exact')

    class Meta:
        model = Disbursement
        fields = ['status', 'budget']


class ExpenseFilter(filters.FilterSet):
    budget = filters.UUIDFilter(field_name='budget', lookup_expr='exact')
    budget_item = filters.UUIDFilter(field_name='budget_item', lookup_expr='exact')
    is_approved = filters.BooleanFilter(field_name='is_approved')

    class Meta:
        model = Expense
        fields = ['budget', 'budget_item', 'is_approved']
