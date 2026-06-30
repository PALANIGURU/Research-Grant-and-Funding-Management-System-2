"""
Views for the grants app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from accounts.permissions import IsAdminOrGrantManager
from .models import FundingAgency, GrantCategory, Grant, GrantStatus
from .serializers import (
    FundingAgencySerializer,
    GrantCategorySerializer,
    GrantListSerializer,
    GrantDetailSerializer,
    GrantCreateUpdateSerializer,
)
from .filters import GrantFilter
from .services import GrantService


class FundingAgencyViewSet(viewsets.ModelViewSet):
    queryset = FundingAgency.objects.all()
    serializer_class = FundingAgencySerializer
    filter_backends = [SearchFilter]
    search_fields = ['name', 'description']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminOrGrantManager()]
        return [IsAuthenticated()]


class GrantCategoryViewSet(viewsets.ModelViewSet):
    queryset = GrantCategory.objects.all()
    serializer_class = GrantCategorySerializer
    filter_backends = [SearchFilter]
    search_fields = ['name', 'description']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminOrGrantManager()]
        return [IsAuthenticated()]


class GrantViewSet(viewsets.ModelViewSet):
    queryset = Grant.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = GrantFilter
    search_fields = ['title', 'description', 'reference_number']
    ordering_fields = ['created_at', 'total_amount', 'application_deadline']
    ordering = ['-created_at']

    def get_queryset(self):
        # Annotate with proposal counts
        return super().get_queryset().annotate(proposal_count=Count('proposals'))

    def get_serializer_class(self):
        if self.action == 'list':
            return GrantListSerializer
        elif self.action == 'retrieve':
            return GrantDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return GrantCreateUpdateSerializer
        return GrantListSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'open', 'close', 'award', 'complete', 'cancel']:
            return [IsAuthenticated(), IsAdminOrGrantManager()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def open(self, request, pk=None):
        grant = self.get_object()
        grant = GrantService.transition_status(grant, GrantStatus.OPEN, request.user)
        serializer = GrantDetailSerializer(grant)
        return Response({'success': True, 'data': serializer.data})

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        grant = self.get_object()
        grant = GrantService.transition_status(grant, GrantStatus.CLOSED, request.user)
        serializer = GrantDetailSerializer(grant)
        return Response({'success': True, 'data': serializer.data})

    @action(detail=True, methods=['post'])
    def award(self, request, pk=None):
        grant = self.get_object()
        grant = GrantService.transition_status(grant, GrantStatus.AWARDED, request.user)
        serializer = GrantDetailSerializer(grant)
        return Response({'success': True, 'data': serializer.data})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        grant = self.get_object()
        grant = GrantService.transition_status(grant, GrantStatus.COMPLETED, request.user)
        serializer = GrantDetailSerializer(grant)
        return Response({'success': True, 'data': serializer.data})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        grant = self.get_object()
        grant = GrantService.transition_status(grant, GrantStatus.CANCELLED, request.user)
        serializer = GrantDetailSerializer(grant)
        return Response({'success': True, 'data': serializer.data})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        stats = GrantService.get_grant_statistics()
        return Response({'success': True, 'data': stats})
