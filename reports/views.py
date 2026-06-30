"""
Views for the reports app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from django.utils import timezone

from accounts.permissions import (
    IsAdminOrGrantManager,
    IsOwnerOrAdmin,
)
from .models import Milestone, MilestoneStatus, ProgressReport, FinalReport, ReportStatus
from .serializers import (
    MilestoneSerializer,
    MilestoneCreateSerializer,
    ProgressReportListSerializer,
    ProgressReportDetailSerializer,
    ProgressReportCreateSerializer,
    FinalReportSerializer,
    FinalReportCreateSerializer,
)
from .filters import MilestoneFilter, ProgressReportFilter, FinalReportFilter
from .services import ReportService


class MilestoneViewSet(viewsets.ModelViewSet):
    queryset = Milestone.objects.all()
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = MilestoneFilter
    ordering_fields = ['due_date', 'completion_percentage']
    ordering = ['due_date']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return MilestoneCreateSerializer
        return MilestoneSerializer

    def get_permissions(self):
        if self.action in ['create', 'destroy', 'check_overdue']:
            return [IsAuthenticated(), IsAdminOrGrantManager()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['post'])
    def mark_complete(self, request, pk=None):
        milestone = self.get_object()
        milestone.status = MilestoneStatus.COMPLETED
        milestone.completion_date = timezone.now().date()
        milestone.completion_percentage = 100
        milestone.save(update_fields=['status', 'completion_date', 'completion_percentage'])
        return Response({'success': True, 'data': MilestoneSerializer(milestone).data})

    @action(detail=False, methods=['post'])
    def check_overdue(self, request):
        count = ReportService.check_overdue_milestones()
        return Response({'success': True, 'message': f"Updated {count} overdue milestones."})


class ProgressReportViewSet(viewsets.ModelViewSet):
    queryset = ProgressReport.objects.all()
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = ProgressReportFilter
    ordering_fields = ['created_at', 'submitted_at']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        if user.role in ['ADMIN', 'GRANT_MANAGER']:
            return queryset
        else:
            # Researchers see progress reports for their own grants
            return queryset.filter(submitted_by=user)

    def get_serializer_class(self):
        if self.action == 'list':
            return ProgressReportListSerializer
        elif self.action == 'retrieve':
            return ProgressReportDetailSerializer
        elif self.action == 'create':
            return ProgressReportCreateSerializer
        return ProgressReportDetailSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy', 'submit']:
            return [IsAuthenticated(), IsOwnerOrAdmin()]
        elif self.action in ['review']:
            return [IsAuthenticated(), IsAdminOrGrantManager()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(submitted_by=self.request.user)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        report = self.get_object()
        report = ReportService.submit_progress_report(report, request.user)
        return Response({'success': True, 'data': ProgressReportDetailSerializer(report).data})

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        report = self.get_object()
        comments = request.data.get('review_comments', '')
        action_type = request.data.get('action', '')  # 'APPROVE' or 'REVISE'

        if action_type == 'APPROVE':
            report.status = ReportStatus.APPROVED
        elif action_type == 'REVISE':
            report.status = ReportStatus.REVIEWED
        else:
            return Response(
                {'success': False, 'message': "Action must be 'APPROVE' or 'REVISE'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        report.reviewed_by = request.user
        report.review_comments = comments
        report.save(update_fields=['status', 'reviewed_by', 'review_comments'])
        return Response({'success': True, 'data': ProgressReportDetailSerializer(report).data})


class FinalReportViewSet(viewsets.ModelViewSet):
    queryset = FinalReport.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_class = FinalReportFilter

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        if user.role in ['ADMIN', 'GRANT_MANAGER']:
            return queryset
        else:
            return queryset.filter(submitted_by=user)

    def get_serializer_class(self):
        if self.action == 'create':
            return FinalReportCreateSerializer
        return FinalReportSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy', 'submit']:
            return [IsAuthenticated(), IsOwnerOrAdmin()]
        elif self.action in ['review']:
            return [IsAuthenticated(), IsAdminOrGrantManager()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(submitted_by=self.request.user)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        report = self.get_object()
        report = ReportService.submit_final_report(report, request.user)
        return Response({'success': True, 'data': FinalReportSerializer(report).data})

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        report = self.get_object()
        comments = request.data.get('review_comments', '')
        action_type = request.data.get('action', '')  # 'APPROVE' or 'REVISE'

        if action_type == 'APPROVE':
            report.status = ReportStatus.APPROVED
        elif action_type == 'REVISE':
            report.status = ReportStatus.REVIEWED
        else:
            return Response(
                {'success': False, 'message': "Action must be 'APPROVE' or 'REVISE'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        report.reviewed_by = request.user
        report.review_comments = comments
        report.save(update_fields=['status', 'reviewed_by', 'review_comments'])
        return Response({'success': True, 'data': FinalReportSerializer(report).data})
