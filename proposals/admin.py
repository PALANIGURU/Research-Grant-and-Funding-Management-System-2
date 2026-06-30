"""
Django admin registrations for the proposals app.
"""
from django.contrib import admin
from .models import Proposal, ProposalReview, ProposalAttachment


@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
    list_display = ('reference_number', 'title', 'grant', 'submitted_by', 'status', 'submitted_at')
    list_filter = ('status', 'grant', 'submitted_at')
    search_fields = ('reference_number', 'title', 'abstract')
    raw_id_fields = ('grant', 'submitted_by')
    readonly_fields = ('reference_number',)


@admin.register(ProposalReview)
class ProposalReviewAdmin(admin.ModelAdmin):
    list_display = ('proposal', 'reviewer', 'score', 'recommendation', 'reviewed_at')
    list_filter = ('recommendation', 'reviewed_at')
    search_fields = ('proposal__reference_number', 'reviewer__email', 'comments')
    raw_id_fields = ('proposal', 'reviewer')


@admin.register(ProposalAttachment)
class ProposalAttachmentAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'proposal', 'file_size', 'uploaded_by', 'created_at')
    search_fields = ('file_name', 'description')
    raw_id_fields = ('proposal', 'uploaded_by')
