"""
Serializers for the proposals app.
"""
from rest_framework import serializers
from django.db.models import Avg
from accounts.serializers import UserListSerializer
from grants.serializers import GrantListSerializer
from .models import Proposal, ProposalReview, ProposalAttachment


class ProposalAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by = UserListSerializer(read_only=True)
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)

    class Meta:
        model = ProposalAttachment
        fields = [
            'id', 'file', 'file_name', 'file_size', 'document_type',
            'document_type_display', 'uploaded_by', 'description', 'created_at',
        ]
        read_only_fields = ['id', 'file_size', 'uploaded_by', 'created_at']

class ProposalReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()

    class Meta:
        model = ProposalReview
        fields = [
            'id', 'proposal', 'reviewer', 'reviewer_name', 'score',
            'methodology_score', 'impact_score', 'feasibility_score',
            'budget_score', 'comments', 'recommendation', 'reviewed_at',
        ]
        read_only_fields = ['id', 'reviewer', 'reviewed_at']

    def get_reviewer_name(self, obj):
        return obj.reviewer.get_full_name()


class ProposalReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProposalReview
        fields = [
            'score', 'methodology_score', 'impact_score',
            'feasibility_score', 'budget_score', 'comments',
            'recommendation',
        ]


class ProposalListSerializer(serializers.ModelSerializer):
    grant = serializers.CharField(source='grant.title', read_only=True)
    submitted_by = serializers.CharField(source='submitted_by.get_full_name', read_only=True)
    average_score = serializers.SerializerMethodField()

    class Meta:
        model = Proposal
        fields = [
            'id', 'title', 'reference_number', 'grant', 'submitted_by',
            'budget_requested', 'status', 'submitted_at', 'average_score',
        ]

    def get_average_score(self, obj):
        return obj.reviews.aggregate(avg=Avg('score'))['avg'] or 0.0


class ProposalDetailSerializer(serializers.ModelSerializer):
    grant = GrantListSerializer(read_only=True)
    submitted_by = UserListSerializer(read_only=True)
    reviews = ProposalReviewSerializer(many=True, read_only=True)
    attachments = ProposalAttachmentSerializer(many=True, read_only=True)
    average_score = serializers.SerializerMethodField()

    class Meta:
        model = Proposal
        fields = '__all__'

    def get_average_score(self, obj):
        return obj.reviews.aggregate(avg=Avg('score'))['avg'] or 0.0


class ProposalCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proposal
        fields = [
            'grant', 'title', 'abstract', 'methodology',
            'expected_outcomes', 'budget_requested', 'duration_months',
            'team_members',
        ]

    def validate(self, attrs):
        grant = attrs.get('grant')
        user = self.context['request'].user

        if not grant.is_open:
            raise serializers.ValidationError({
                'grant': 'This grant is currently closed and not accepting proposals.'
            })

        # Check max proposal limit
        existing_count = Proposal.objects.filter(grant=grant, submitted_by=user).count()
        if existing_count >= grant.max_proposals_per_researcher:
            raise serializers.ValidationError({
                'grant': f'You have reached the maximum proposal limit of {grant.max_proposals_per_researcher} for this grant.'
            })

        return attrs


class ProposalUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proposal
        fields = [
            'title', 'abstract', 'methodology', 'expected_outcomes',
            'budget_requested', 'duration_months', 'team_members',
        ]

    def validate(self, attrs):
        instance = self.instance
        if instance and instance.status not in ['DRAFT', 'REVISION_REQUESTED']:
            raise serializers.ValidationError(
                'Proposals can only be updated when in DRAFT or REVISION_REQUESTED state.'
            )
        return attrs
