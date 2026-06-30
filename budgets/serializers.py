"""
Serializers for the budgets app.
"""
from rest_framework import serializers
from accounts.serializers import UserListSerializer
from .models import Budget, BudgetItem, Disbursement, Expense


class BudgetItemSerializer(serializers.ModelSerializer):
    remaining = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)

    class Meta:
        model = BudgetItem
        fields = ['id', 'category', 'description', 'amount_allocated', 'amount_spent', 'remaining']
        read_only_fields = ['id', 'amount_spent', 'remaining']


class ExpenseSerializer(serializers.ModelSerializer):
    recorded_by = UserListSerializer(read_only=True)
    budget_item_category = serializers.CharField(source='budget_item.category', read_only=True)

    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ['id', 'is_approved', 'approved_by', 'recorded_by']


class ExpenseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['budget_item', 'description', 'amount', 'expense_date', 'receipt']


class DisbursementSerializer(serializers.ModelSerializer):
    requested_by = UserListSerializer(read_only=True)
    approved_by = UserListSerializer(read_only=True)

    class Meta:
        model = Disbursement
        fields = '__all__'
        read_only_fields = ['id', 'status', 'reference_number', 'requested_by', 'approved_by', 'approved_at']


class DisbursementCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disbursement
        fields = ['amount', 'disbursement_date', 'description']


class BudgetListSerializer(serializers.ModelSerializer):
    grant_title = serializers.CharField(source='grant.title', read_only=True)
    grant_reference = serializers.CharField(source='grant.reference_number', read_only=True)
    remaining_amount = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    utilization_percentage = serializers.FloatField(read_only=True)

    class Meta:
        model = Budget
        fields = [
            'id', 'grant_title', 'grant_reference', 'total_allocated',
            'total_spent', 'remaining_amount', 'utilization_percentage', 'status',
        ]


class BudgetDetailSerializer(serializers.ModelSerializer):
    items = BudgetItemSerializer(many=True, read_only=True)
    disbursements = DisbursementSerializer(many=True, read_only=True)
    expenses = ExpenseSerializer(many=True, read_only=True)
    remaining_amount = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    utilization_percentage = serializers.FloatField(read_only=True)

    class Meta:
        model = Budget
        fields = '__all__'
        read_only_fields = ['id', 'total_spent', 'approved_by', 'approved_at', 'remaining_amount', 'utilization_percentage']


class BudgetCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ['grant', 'total_allocated', 'notes']

    def validate(self, attrs):
        grant = attrs.get('grant')
        if grant.status != 'AWARDED':
            raise serializers.ValidationError({
                'grant': 'Budgets can only be created for awarded grants.'
            })
        if Budget.objects.filter(grant=grant).exists():
            raise serializers.ValidationError({
                'grant': 'A budget already exists for this grant.'
            })
        return attrs
