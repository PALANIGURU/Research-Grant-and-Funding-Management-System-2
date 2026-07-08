"""
Views for the proposals app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import models

from accounts.permissions import (
    IsAdminOrGrantManager,
    IsReviewer,
    IsOwnerOrAdmin,
)
from .models import Proposal, ProposalReview, ProposalAttachment, ProposalStatus, ProposalAIReview
from . import ai_service
from .serializers import (
    ProposalListSerializer,
    ProposalDetailSerializer,
    ProposalCreateSerializer,
    ProposalUpdateSerializer,
    ProposalAIReviewSerializer,
    ProposalAttachmentSerializer,
    ProposalReviewSerializer,
    ProposalReviewCreateSerializer,
)
from .filters import ProposalFilter
from .services import ProposalService


class ProposalViewSet(viewsets.ModelViewSet):
    queryset = Proposal.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProposalFilter
    search_fields = ['title', 'abstract', 'reference_number']
    ordering_fields = ['created_at', 'submitted_at', 'budget_requested']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        if user.role == 'ADMIN' or user.role == 'GRANT_MANAGER':
            return queryset
        elif user.role == 'REVIEWER':
            # Reviewers see proposals where they have reviews assigned or completed
            return queryset.filter(reviews__reviewer=user)
        else:
            # Researchers see their own proposals
            return queryset.filter(submitted_by=user)

    def get_serializer_class(self):
        if self.action == 'list':
            return ProposalListSerializer
        elif self.action == 'retrieve':
            return ProposalDetailSerializer
        elif self.action == 'create':
            return ProposalCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ProposalUpdateSerializer
        return ProposalListSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy', 'submit', 'resubmit', 'attachments']:
            return [IsAuthenticated(), IsOwnerOrAdmin()]
        elif self.action in ['start_review', 'approve', 'reject', 'request_revision']:
            return [IsAuthenticated(), IsAdminOrGrantManager()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(submitted_by=self.request.user)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        proposal = self.get_object()
        proposal = ProposalService.submit_proposal(proposal, request.user)
        serializer = ProposalDetailSerializer(proposal)
        return Response({'success': True, 'data': serializer.data})

    @action(detail=True, methods=['post'])
    def start_review(self, request, pk=None):
        proposal = self.get_object()
        proposal = ProposalService.transition_status(proposal, ProposalStatus.UNDER_REVIEW, request.user)
        serializer = ProposalDetailSerializer(proposal)
        return Response({'success': True, 'data': serializer.data})

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        proposal = self.get_object()
        proposal = ProposalService.transition_status(proposal, ProposalStatus.APPROVED, request.user)
        serializer = ProposalDetailSerializer(proposal)
        return Response({'success': True, 'data': serializer.data})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        proposal = self.get_object()
        reason = request.data.get('rejection_reason', '')
        proposal = ProposalService.transition_status(
            proposal, ProposalStatus.REJECTED, request.user, rejection_reason=reason
        )
        serializer = ProposalDetailSerializer(proposal)
        return Response({'success': True, 'data': serializer.data})

    @action(detail=True, methods=['post'])
    def request_revision(self, request, pk=None):
        proposal = self.get_object()
        comments = request.data.get('revision_comments', '')
        proposal = ProposalService.transition_status(
            proposal, ProposalStatus.REVISION_REQUESTED, request.user, revision_comments=comments
        )
        serializer = ProposalDetailSerializer(proposal)
        return Response({'success': True, 'data': serializer.data})

    @action(detail=True, methods=['post'])
    def resubmit(self, request, pk=None):
        proposal = self.get_object()
        proposal = ProposalService.transition_status(proposal, ProposalStatus.SUBMITTED, request.user)
        serializer = ProposalDetailSerializer(proposal)
        return Response({'success': True, 'data': serializer.data})

    @action(detail=True, methods=['get', 'post'])
    def reviews(self, request, pk=None):
        proposal = self.get_object()
        if request.method == 'GET':
            review_qs = proposal.reviews.all()
            serializer = ProposalReviewSerializer(review_qs, many=True)
            return Response({'success': True, 'data': serializer.data})
        else:
            if request.user.role != 'REVIEWER':
                return Response(
                    {'success': False, 'message': 'Only reviewers can submit a review.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            serializer = ProposalReviewCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            review = serializer.save(proposal=proposal, reviewer=request.user)
            return Response(
                {'success': True, 'data': ProposalReviewSerializer(review).data},
                status=status.HTTP_201_CREATED
            )

    @action(detail=True, methods=['post'])
    def ai_review(self, request, pk=None):
        proposal = self.get_object()
        is_owner = proposal.submitted_by_id == request.user.id
        is_manager = request.user.role in ['ADMIN', 'GRANT_MANAGER']
        if not (is_owner or is_manager):
            return Response(
                {'success': False, 'message': 'You do not have permission to run an AI review on this proposal.'},
                status=status.HTTP_403_FORBIDDEN
            )
        result = ai_service.generate_review_for_proposal(proposal)
        review, _ = ProposalAIReview.objects.update_or_create(
            proposal=proposal,
            defaults={
                'generated_by': request.user,
                'summary': result['summary'],
                'risk_score': result['risk_score'],
                'risk_flags': result['risk_flags'],
                'strengths': result['strengths'],
                'weaknesses': result['weaknesses'],
                'suggested_recommendation': result['suggested_recommendation'],
                'raw_response': result['raw_response'],
            }
        )
        serializer = ProposalAIReviewSerializer(review)
        return Response({'success': True, 'data': serializer.data})
        
    @action(detail=True, methods=['get', 'post'])
    def attachments(self, request, pk=None):
        proposal = self.get_object()
        if request.method == 'GET':
            attachments = proposal.attachments.all()
            serializer = ProposalAttachmentSerializer(attachments, many=True)
            return Response({'success': True, 'data': serializer.data})
        else:
            if 'file' not in request.FILES:
                return Response(
                    {'success': False, 'message': 'No file was provided.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            file = request.FILES['file']
            serializer = ProposalAttachmentSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            attachment = serializer.save(
                proposal=proposal,
                file=file,
                file_name=file.name,
                file_size=file.size,
                uploaded_by=request.user
            )
            return Response(
                {'success': True, 'data': ProposalAttachmentSerializer(attachment).data},
                status=status.HTTP_201_CREATED
            )
