"""
Filters for the proposals app.
"""
from django_filters import rest_framework as filters
from .models import Proposal


class ProposalFilter(filters.FilterSet):
    status = filters.CharFilter(field_name='status', lookup_expr='exact')
    grant = filters.UUIDFilter(field_name='grant', lookup_expr='exact')
    submitted_by = filters.UUIDFilter(field_name='submitted_by', lookup_expr='exact')

    budget_min = filters.NumberFilter(field_name='budget_requested', lookup_expr='gte')
    budget_max = filters.NumberFilter(field_name='budget_requested', lookup_expr='lte')

    submitted_after = filters.DateTimeFilter(field_name='submitted_at', lookup_expr='gte')
    submitted_before = filters.DateTimeFilter(field_name='submitted_at', lookup_expr='lte')

    class Meta:
        model = Proposal
        fields = ['status', 'grant', 'submitted_by']
