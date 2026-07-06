"""
Services for the reports app.
"""
import logging
from django.utils import timezone
from core.exceptions import BusinessLogicError
from .models import Milestone, MilestoneStatus, ProgressReport, ReportStatus
from notifications.services import NotificationService

logger = logging.getLogger('grants_system')


class ReportService:
    """Service layer managing milestones and progress reporting workflows."""

    @staticmethod
    def check_overdue_milestones():
        """Batch update milestones to OVERDUE if deadline has passed."""
        today = timezone.now().date()
        overdue_milestones = Milestone.objects.filter(
            due_date__lt=today,
            status__in=[MilestoneStatus.PENDING, MilestoneStatus.IN_PROGRESS]
        )
        
        milestones_list = list(overdue_milestones)
        count = overdue_milestones.update(status=MilestoneStatus.OVERDUE)
        if count > 0:
            logger.info(f"Cron check: updated {count} milestones to OVERDUE.")
            for milestone in milestones_list:
                NotificationService.notify_milestone_overdue(milestone)
        return count

    @staticmethod
    def submit_progress_report(report, user):
        """Submit a draft progress report."""
        if report.submitted_by != user:
            raise BusinessLogicError("You can only submit your own progress reports.")

        if report.status != ReportStatus.DRAFT:
            raise BusinessLogicError("Only draft progress reports can be submitted.")

        report.status = ReportStatus.SUBMITTED
        report.submitted_at = timezone.now()
        report.save(update_fields=['status', 'submitted_at'])
        
        logger.info(f"Progress Report {report.report_number} submitted by {user.email}")
        NotificationService.notify_progress_report_submitted(report)
        return report

    @staticmethod
    def submit_final_report(report, user):
        """Submit a draft final report."""
        if report.submitted_by != user:
            raise BusinessLogicError("You can only submit your own final reports.")

        if report.status != ReportStatus.DRAFT:
            raise BusinessLogicError("Only draft final reports can be submitted.")

        report.status = ReportStatus.SUBMITTED
        report.submitted_at = timezone.now()
        report.save(update_fields=['status', 'submitted_at'])
        
        logger.info(f"Final Report {report.report_number} submitted by {user.email}")
        NotificationService.notify_final_report_submitted(report)
        return report

    @staticmethod
    def get_grant_progress_summary(grant):
        """Calculate overall milestone completion rates."""
        total_milestones = grant.milestones.count()
        completed = grant.milestones.filter(status=MilestoneStatus.COMPLETED).count()
        
        completion_rate = (completed / total_milestones * 100) if total_milestones > 0 else 0.0
        
        return {
            'total_milestones': total_milestones,
            'completed_milestones': completed,
            'completion_rate': round(completion_rate, 2),
            'progress_reports_count': grant.progress_reports.filter(status=ReportStatus.APPROVED).count()
        }
