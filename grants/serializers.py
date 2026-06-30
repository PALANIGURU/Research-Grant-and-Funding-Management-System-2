"""
Serializers for the grants app.
"""
from rest_framework import serializers
from accounts.serializers import UserListSerializer
from .models import FundingAgency, GrantCategory, Grant


class FundingAgencySerializer(serializers.ModelSerializer):
    class Meta:
        model = FundingAgency
        fields = '__all__'


class GrantCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GrantCategory
        fields = '__all__'


class GrantListSerializer(serializers.ModelSerializer):
    funding_agency = serializers.StringRelatedField()
    category = serializers.StringRelatedField()
    is_open = serializers.BooleanField(read_only=True)

    class Meta:
        model = Grant
        fields = [
            'id', 'title', 'reference_number', 'funding_agency',
            'category', 'total_amount', 'status', 'application_deadline',
            'is_open', 'created_at',
        ]


class GrantDetailSerializer(serializers.ModelSerializer):
    funding_agency = FundingAgencySerializer(read_only=True)
    category = GrantCategorySerializer(read_only=True)
    created_by = UserListSerializer(read_only=True)
    is_open = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    proposal_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Grant
        fields = '__all__'


class GrantCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grant
        fields = [
            'title', 'description', 'funding_agency', 'category',
            'total_amount', 'application_deadline', 'start_date',
            'end_date', 'eligibility_criteria', 'required_documents',
            'max_proposals_per_researcher', 'status',
        ]

    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        deadline = attrs.get('application_deadline')

        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError({
                'end_date': 'End date must be after start date.'
            })

        if deadline and start_date:
            # deadline has timezone info, start_date is a date object
            deadline_date = deadline.date()
            if deadline_date >= start_date:
                raise serializers.ValidationError({
                    'application_deadline': 'Application deadline must be before the grant start date.'
                })

        return attrs
