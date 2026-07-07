"""
AI Proposal Review Assistant service.

Calls the Anthropic Claude API to generate an automated first-pass
review of a proposal: a plain-language summary, a risk score, risk
flags, strengths/weaknesses, and a suggested recommendation.
"""
import json
import logging
import requests
from django.conf import settings
from core.exceptions import BusinessLogicError

logger = logging.getLogger('grants_system')

ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

SYSTEM_PROMPT = (
    "You are a research grant proposal reviewer assistant. "
    "You will be given the details of a grant proposal. "
    "Respond with ONLY a valid JSON object (no markdown, no code fences, "
    "no commentary) with exactly these keys: "
    "\"summary\" (2-3 sentence plain-language summary of the proposal), "
    "\"risk_score\" (integer 0-100, where 0 is very low risk and 100 is very "
    "high risk of failure/misuse of funds), "
    "\"risk_flags\" (array of short strings naming specific concerns, empty "
    "array if none), "
    "\"strengths\" (array of short strings), "
    "\"weaknesses\" (array of short strings), "
    "\"suggested_recommendation\" (one of \"APPROVE\", \"REJECT\", \"REVISE\")."
)


def _build_user_prompt(proposal):
    return (
        f"Title: {proposal.title}\n"
        f"Abstract: {proposal.abstract}\n"
        f"Methodology: {proposal.methodology}\n"
        f"Expected Outcomes: {proposal.expected_outcomes}\n"
        f"Budget Requested: {proposal.budget_requested}\n"
        f"Duration (months): {proposal.duration_months}\n"
    )


def _parse_ai_json(raw_text):
    """Strip any accidental code fences and parse the JSON body."""
    text = raw_text.strip()
    if text.startswith('```'):
        text = text.strip('`')
        if text.lower().startswith('json'):
            text = text[4:]
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError as exc:
        logger.error(f"AI review JSON parse failed: {exc}. Raw: {raw_text[:500]}")
        raise BusinessLogicError(
            "The AI service returned an unexpected response format.",
            code='ai_parse_error',
            status_code=502,
        )


def generate_review_for_proposal(proposal):
    """
    Call the Claude API and return a dict of AI review fields.
    Raises BusinessLogicError on any failure (missing key, network, parse).
    """
    if not settings.ANTHROPIC_API_KEY:
        raise BusinessLogicError(
            "AI review is not configured. Set ANTHROPIC_API_KEY on the server.",
            code='ai_not_configured',
            status_code=503,
        )

    payload = {
        "model": settings.AI_MODEL_NAME,
        "max_tokens": 1024,
        "system": SYSTEM_PROMPT,
        "messages": [
            {"role": "user", "content": _build_user_prompt(proposal)}
        ],
    }
    headers = {
        "x-api-key": settings.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    try:
        response = requests.post(
            ANTHROPIC_API_URL, headers=headers, json=payload, timeout=30
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        logger.error(f"AI review request failed for proposal {proposal.pk}: {exc}")
        raise BusinessLogicError(
            "Could not reach the AI review service. Please try again later.",
            code='ai_service_unavailable',
            status_code=502,
        )

    data = response.json()
    text_blocks = [b.get('text', '') for b in data.get('content', []) if b.get('type') == 'text']
    raw_text = ''.join(text_blocks)

    parsed = _parse_ai_json(raw_text)

    return {
        'summary': parsed.get('summary', ''),
        'risk_score': int(parsed.get('risk_score', 0)),
        'risk_flags': parsed.get('risk_flags', []),
        'strengths': parsed.get('strengths', []),
        'weaknesses': parsed.get('weaknesses', []),
        'suggested_recommendation': parsed.get('suggested_recommendation', ''),
        'raw_response': raw_text,
    }