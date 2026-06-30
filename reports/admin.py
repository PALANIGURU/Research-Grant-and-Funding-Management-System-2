"""
Django admin registrations for the reports app.
"""
from django.contrib import admin
from .models import Milestone, ProgressReport, FinalReport


@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ('title', 'grant', 'due_date', 'status', 'completion_percentage', 'assigned_to')
    list_filter = ('status', 'due_date')
    search_fields = ('title', 'description', 'grant__title')
    raw_id_fields = ('grant', 'assigned_to')


@admin.register(ProgressReport)
class ProgressReportAdmin(admin.ModelAdmin):
    list_display = ('report_number', 'grant', 'period_start', 'period_end', 'status', 'submitted_by', 'submitted_at')
    list_filter = ('status', 'submitted_at')
    search_fields = ('report_number', 'summary', 'grant__title')
    raw_id_fields = ('grant', 'milestone', 'submitted_by', 'reviewed_by')
    readonly_fields = ('report_number',)


@admin.register(FinalReport)
class FinalReportAdmin(admin.ModelAdmin):
    list_display = ('report_number', 'grant', 'total_expenditure', 'status', 'submitted_by', 'submitted_at')
    list_filter = ('status', 'submitted_at')
    search_fields = ('report_number', 'summary', 'grant__title')
    raw_id_fields = ('grant', 'submitted_by', 'reviewed_by')
    readonly_fields = ('report_number',)
