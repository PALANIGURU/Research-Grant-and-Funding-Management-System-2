"""
Serializers for the reports app.
"""
from rest_framework import serializers
from accounts.serializers import UserListSerializer
from grants.serializers import GrantListSerializer
from .models import Milestone, ProgressReport, FinalReport


class MilestoneSerializer(serializers.ModelSerializer):
    assigned_to = UserListSerializer(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = Milestone
        fields = '__all__'
        read_only_fields = ['id', 'is_overdue']


class MilestoneCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = ['grant', 'title', 'description', 'due_date', 'assigned_to', 'deliverables']


class ProgressReportListSerializer(serializers.ModelSerializer):
    grant_title = serializers.CharField(source='grant.title', read_only=True)
    submitted_by = serializers.CharField(source='submitted_by.get_full_name', read_only=True)

    class Meta:
        model = ProgressReport
        fields = [
            'id', 'report_number', 'grant_title', 'submitted_by',
            'period_start', 'period_end', 'status', 'submitted_at',
        ]


class ProgressReportDetailSerializer(serializers.ModelSerializer):
    grant = GrantListSerializer(read_only=True)
    milestone = MilestoneSerializer(read_only=True)
    submitted_by = UserListSerializer(read_only=True)
    reviewed_by = UserListSerializer(read_only=True)

    class Meta:
        model = ProgressReport
        fields = '__all__'
        read_only_fields = ['id', 'report_number', 'submitted_by', 'submitted_at', 'reviewed_by']


class ProgressReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressReport
        fields = [
            'grant', 'milestone', 'period_start', 'period_end',
            'summary', 'activities_completed', 'challenges',
            'next_steps', 'expenditure_summary',
        ]

    def validate(self, attrs):
        start = attrs.get('period_start')
        end = attrs.get('period_end')
        
        if start and end and start >= end:
            raise serializers.ValidationError({
                'period_end': 'Reporting period end date must be after start date.'
            })
        return attrs


class FinalReportSerializer(serializers.ModelSerializer):
    grant = GrantListSerializer(read_only=True)
    submitted_by = UserListSerializer(read_only=True)
    reviewed_by = UserListSerializer(read_only=True)

    class Meta:
        model = FinalReport
        fields = '__all__'
        read_only_fields = ['id', 'report_number', 'submitted_by', 'submitted_at', 'reviewed_by']


class FinalReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinalReport
        fields = [
            'grant', 'summary', 'objectives_achieved', 'outcomes',
            'publications', 'financial_summary', 'total_expenditure',
            'lessons_learned', 'recommendations',
        ]
        
    def validate(self, attrs):
        grant = attrs.get('grant')
        if FinalReport.objects.filter(grant=grant).exists():
            raise serializers.ValidationError({
                'grant': 'A final report has already been created for this grant.'
            })
        return attrs
