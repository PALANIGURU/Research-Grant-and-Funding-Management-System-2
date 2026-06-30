"""
Django admin registrations for the grants app.
"""
from django.contrib import admin
from .models import FundingAgency, GrantCategory, Grant


@admin.register(FundingAgency)
class FundingAgencyAdmin(admin.ModelAdmin):
    list_display = ('name', 'website', 'contact_email', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    ordering = ('name',)


@admin.register(GrantCategory)
class GrantCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('name',)


@admin.register(Grant)
class GrantAdmin(admin.ModelAdmin):
    list_display = (
        'reference_number', 'title', 'funding_agency',
        'category', 'total_amount', 'status', 'application_deadline'
    )
    list_filter = ('status', 'funding_agency', 'category', 'application_deadline')
    search_fields = ('reference_number', 'title', 'description', 'eligibility_criteria')
    raw_id_fields = ('created_by',)
    readonly_fields = ('reference_number',)
    ordering = ('-created_at',)
