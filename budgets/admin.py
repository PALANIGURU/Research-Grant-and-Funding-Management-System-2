"""
Django admin registrations for the budgets app.
"""
from django.contrib import admin
from .models import Budget, BudgetItem, Disbursement, Expense


class BudgetItemInline(admin.TabularInline):
    model = BudgetItem
    extra = 1


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('grant', 'total_allocated', 'total_spent', 'status', 'approved_by', 'approved_at')
    list_filter = ('status', 'approved_at')
    search_fields = ('grant__title', 'grant__reference_number')
    raw_id_fields = ('grant', 'approved_by')
    inlines = [BudgetItemInline]


@admin.register(BudgetItem)
class BudgetItemAdmin(admin.ModelAdmin):
    list_display = ('category', 'description', 'budget', 'amount_allocated', 'amount_spent')
    list_filter = ('category', 'budget__status')
    search_fields = ('description', 'budget__grant__title')
    raw_id_fields = ('budget',)


@admin.register(Disbursement)
class DisbursementAdmin(admin.ModelAdmin):
    list_display = ('reference_number', 'budget', 'amount', 'disbursement_date', 'status', 'requested_by')
    list_filter = ('status', 'disbursement_date')
    search_fields = ('reference_number', 'description', 'budget__grant__title')
    raw_id_fields = ('budget', 'requested_by', 'approved_by')
    readonly_fields = ('reference_number',)


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('description', 'budget', 'budget_item', 'amount', 'expense_date', 'recorded_by', 'is_approved')
    list_filter = ('is_approved', 'expense_date')
    search_fields = ('description', 'budget__grant__title')
    raw_id_fields = ('budget', 'budget_item', 'recorded_by', 'approved_by')
