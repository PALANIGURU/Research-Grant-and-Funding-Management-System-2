"""
Filters for the reports app.
"""
from django_filters import rest_framework as filters
from .models import Milestone, ProgressReport, FinalReport


class MilestoneFilter(filters.FilterSet):
    status = filters.CharFilter(field_name='status', lookup_expr='exact')
    grant = filters.UUIDFilter(field_name='grant', lookup_expr='exact')
    assigned_to = filters.UUIDFilter(field_name='assigned_to', lookup_expr='exact')

    class Meta:
        model = Milestone
        fields = ['status', 'grant', 'assigned_to']


class ProgressReportFilter(filters.FilterSet):
    status = filters.CharFilter(field_name='status', lookup_expr='exact')
    grant = filters.UUIDFilter(field_name='grant', lookup_expr='exact')
    submitted_by = filters.UUIDFilter(field_name='submitted_by', lookup_expr='exact')

    class Meta:
        model = ProgressReport
        fields = ['status', 'grant', 'submitted_by']


class FinalReportFilter(filters.FilterSet):
    status = filters.CharFilter(field_name='status', lookup_expr='exact')
    grant = filters.UUIDFilter(field_name='grant', lookup_expr='exact')

    class Meta:
        model = FinalReport
        fields = ['status', 'grant']
