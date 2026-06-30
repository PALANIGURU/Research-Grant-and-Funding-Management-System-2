"""
Filters for the grants app.
"""
from django_filters import rest_framework as filters
from .models import Grant


class GrantFilter(filters.FilterSet):
    status = filters.CharFilter(field_name='status', lookup_expr='exact')
    funding_agency = filters.UUIDFilter(field_name='funding_agency', lookup_expr='exact')
    category = filters.UUIDFilter(field_name='category', lookup_expr='exact')
    
    total_amount_min = filters.NumberFilter(field_name='total_amount', lookup_expr='gte')
    total_amount_max = filters.NumberFilter(field_name='total_amount', lookup_expr='lte')
    
    deadline_after = filters.DateTimeFilter(field_name='application_deadline', lookup_expr='gte')
    deadline_before = filters.DateTimeFilter(field_name='application_deadline', lookup_expr='lte')

    class Meta:
        model = Grant
        fields = ['status', 'funding_agency', 'category']
