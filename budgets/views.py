"""
Views for the budgets app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from accounts.permissions import (
    IsAdminOrFinanceOfficer,
    IsFinanceOfficer,
    IsOwnerOrAdmin,
)
from .models import Budget, BudgetItem, Disbursement, DisbursementStatus, Expense, BudgetStatus
from .serializers import (
    BudgetListSerializer,
    BudgetDetailSerializer,
    BudgetCreateSerializer,
    BudgetItemSerializer,
    DisbursementSerializer,
    DisbursementCreateSerializer,
    ExpenseSerializer,
    ExpenseCreateSerializer,
)
from .filters import BudgetFilter, DisbursementFilter, ExpenseFilter
from .services import BudgetService
from notifications.services import NotificationService

class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.all()
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = BudgetFilter
    ordering_fields = ['created_at', 'total_allocated', 'total_spent']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        if user.role in ['ADMIN', 'FINANCE_OFFICER', 'GRANT_MANAGER']:
            return queryset
        else:
            # Researchers see budgets only for their submitted grants
            return queryset.filter(grant__proposals__submitted_by=user, grant__status='AWARDED').distinct()

    def get_serializer_class(self):
        if self.action == 'list':
            return BudgetListSerializer
        elif self.action == 'retrieve':
            return BudgetDetailSerializer
        elif self.action == 'create':
            return BudgetCreateSerializer
        return BudgetListSerializer

    def get_permissions(self):
        if self.action in ['create', 'destroy', 'activate', 'freeze', 'close']:
            return [IsAuthenticated(), IsAdminOrFinanceOfficer()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        budget = self.get_object()
        budget.status = BudgetStatus.ACTIVE
        budget.save(update_fields=['status'])
        return Response({'success': True, 'data': BudgetDetailSerializer(budget).data})

    @action(detail=True, methods=['post'])
    def freeze(self, request, pk=None):
        budget = self.get_object()
        budget.status = BudgetStatus.FROZEN
        budget.save(update_fields=['status'])
        return Response({'success': True, 'data': BudgetDetailSerializer(budget).data})

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        budget = self.get_object()
        budget.status = BudgetStatus.CLOSED
        budget.save(update_fields=['status'])
        return Response({'success': True, 'data': BudgetDetailSerializer(budget).data})

    @action(detail=True, methods=['get', 'post'])
    def items(self, request, pk=None):
        budget = self.get_object()
        if request.method == 'GET':
            items = budget.items.all()
            serializer = BudgetItemSerializer(items, many=True)
            return Response({'success': True, 'data': serializer.data})
        else:
            # Add line items (Finance officers or Admins only)
            if request.user.role not in ['ADMIN', 'FINANCE_OFFICER']:
                return Response(
                    {'success': False, 'message': 'Only financial roles can add budget items.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            serializer = BudgetItemSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            item = serializer.save(budget=budget)
            return Response(
                {'success': True, 'data': BudgetItemSerializer(item).data},
                status=status.HTTP_201_CREATED
            )

    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        budget = self.get_object()
        summary = BudgetService.get_budget_summary(budget)
        return Response({'success': True, 'data': summary})

    @action(detail=True, methods=['get', 'post'])
    def disbursements(self, request, pk=None):
        budget = self.get_object()
        if request.method == 'GET':
            disbursements = budget.disbursements.all()
            serializer = DisbursementSerializer(disbursements, many=True)
            return Response({'success': True, 'data': serializer.data})
        else:
            # Researchers or finance officers request disbursements
            serializer = DisbursementCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            disbursement = serializer.save(
                budget=budget,
                requested_by=request.user,
                status=DisbursementStatus.PENDING
            )
            return Response(
                {'success': True, 'data': DisbursementSerializer(disbursement).data},
                status=status.HTTP_201_CREATED
            )

    @action(detail=True, methods=['get', 'post'])
    def expenses(self, request, pk=None):
        budget = self.get_object()
        if request.method == 'GET':
            expenses = budget.expenses.all()
            serializer = ExpenseSerializer(expenses, many=True)
            return Response({'success': True, 'data': serializer.data})
        else:
            serializer = ExpenseCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Check line item belongs to this budget
            budget_item = serializer.validated_data['budget_item']
            if budget_item.budget != budget:
                return Response(
                    {'success': False, 'message': 'Line item does not belong to this budget.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            expense = BudgetService.record_expense(
                budget_item=budget_item,
                amount=serializer.validated_data['amount'],
                description=serializer.validated_data['description'],
                user=request.user,
                expense_date=serializer.validated_data.get('expense_date'),
                receipt=request.FILES.get('receipt')
            )
            return Response(
                {'success': True, 'data': ExpenseSerializer(expense).data},
                status=status.HTTP_201_CREATED
            )


class DisbursementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Disbursement.objects.all()
    serializer_class = DisbursementSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = DisbursementFilter
    ordering_fields = ['created_at', 'amount', 'disbursement_date']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['approve', 'disburse', 'reject']:
            return [IsAuthenticated(), IsFinanceOfficer()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        disbursement = self.get_object()
        disbursement = BudgetService.approve_disbursement(disbursement, request.user)
        return Response({'success': True, 'data': DisbursementSerializer(disbursement).data})

    @action(detail=True, methods=['post'])
    def disburse(self, request, pk=None):
        disbursement = self.get_object()
        if disbursement.status != DisbursementStatus.APPROVED:
            return Response(
                {'success': False, 'message': 'Disbursement must be approved first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        disbursement.status = DisbursementStatus.DISBURSED
        disbursement.save(update_fields=['status'])
        NotificationService.notify_disbursement_disbursed(disbursement)
        return Response({'success': True, 'data': DisbursementSerializer(disbursement).data})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        disbursement = self.get_object()
        reason = request.data.get('rejection_reason', '')
        if not reason:
            return Response(
                {'success': False, 'message': 'Rejection reason is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        disbursement.status = DisbursementStatus.REJECTED
        disbursement.rejection_reason = reason
        disbursement.save(update_fields=['status', 'rejection_reason'])
        NotificationService.notify_disbursement_rejected(disbursement)
        return Response({'success': True, 'data': DisbursementSerializer(disbursement).data})
