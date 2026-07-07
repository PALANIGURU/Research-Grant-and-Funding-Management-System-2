"""
AI Proposal Review Assistant service.

Calls the Groq API (free tier) to generate an automated first-pass review
of a proposal: a plain-language summary, a risk score, risk flags,
strengths/weaknesses, and a suggested recommendation.

Also reads the text content of the proposal's uploaded supporting
documents (PDF, DOCX, TXT) so the review considers what was actually
submitted, not just the proposal's text fields. This is a plausibility /
triage review for a human reviewer to double-check things against  it
does NOT and cannot verify whether a document is forged or authentic.
"""
import json
import logging
from django.conf import settings
from groq import Groq
from core.exceptions import BusinessLogicError

logger = logging.getLogger('grants_system')

MAX_CHARS_PER_DOCUMENT = 4000
MAX_DOCUMENTS = 5

SYSTEM_PROMPT = (
    "You are a research grant proposal reviewer assistant helping a human "
    "reviewer triage a submission. You will be given the proposal's text "
    "fields and, when available, the extracted text of its supporting "
    "documents. "
    "IMPORTANT: you cannot verify whether a document is forged, "
    "digitally altered, or authentic — you can only assess whether its "
    "content is plausible, complete, and consistent with the proposal's "
    "claims. Never claim to have confirmed authenticity. "
    "Respond with ONLY a valid JSON object (no markdown, no code fences, "
    "no commentary) with exactly these keys: "
    "\"summary\" (2-3 sentence plain-language summary of the proposal and "
    "its documents), "
    "\"risk_score\" (integer 0-100, where 0 is very low risk and 100 is "
    "very high risk of failure/misuse of funds, based on plausibility and "
    "completeness only, not verified authenticity), "
    "\"risk_flags\" (array of short strings naming specific concerns — "
    "e.g. inconsistent claims, thin or generic document content, missing "
    "expected documents, mismatched details between the proposal and its "
    "attachments — empty array if none), "
    "\"strengths\" (array of short strings), "
    "\"weaknesses\" (array of short strings), "
    "\"suggested_recommendation\" (one of \"APPROVE\", \"REJECT\", "
    "\"REVISE\")."
)


def _extract_pdf_text(file_obj):
    from pypdf import PdfReader
    reader = PdfReader(file_obj)
    text = ''
    for page in reader.pages:
        text += page.extract_text() or ''
        if len(text) >= MAX_CHARS_PER_DOCUMENT:
            break
    return text[:MAX_CHARS_PER_DOCUMENT]


def _extract_docx_text(file_obj):
    from docx import Document
    doc = Document(file_obj)
    text = '\n'.join(p.text for p in doc.paragraphs)
    return text[:MAX_CHARS_PER_DOCUMENT]


def _extract_attachment_text(attachment):
    """Best-effort text extraction; returns '' on unsupported/failed files."""
    name = attachment.file_name.lower()
    try:
        with attachment.file.open('rb') as f:
            if name.endswith('.pdf'):
                return _extract_pdf_text(f)
            elif name.endswith('.docx'):
                return _extract_docx_text(f)
            elif name.endswith('.txt'):
                return f.read().decode('utf-8', errors='ignore')[:MAX_CHARS_PER_DOCUMENT]
    except Exception as exc:
        logger.warning(f"Could not extract text from attachment {attachment.pk}: {exc}")
    return ''


def _build_user_prompt(proposal):
    prompt = (
        f"Title: {proposal.title}\n"
        f"Abstract: {proposal.abstract}\n"
        f"Methodology: {proposal.methodology}\n"
        f"Expected Outcomes: {proposal.expected_outcomes}\n"
        f"Budget Requested: {proposal.budget_requested}\n"
        f"Duration (months): {proposal.duration_months}\n"
    )

    attachments = proposal.attachments.all()[:MAX_DOCUMENTS]
    if attachments:
        prompt += "\n--- Supporting Documents ---\n"
        for att in attachments:
            text = _extract_attachment_text(att)
            doc_type = att.get_document_type_display() if hasattr(att, 'get_document_type_display') else att.document_type
            prompt += f"\n[{doc_type}: {att.file_name}]\n"
            prompt += text if text else "(Could not extract readable text from this file.)"
            prompt += "\n"
    else:
        prompt += "\n(No supporting documents were uploaded.)\n"

    return prompt


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
    Call the Groq API and return a dict of AI review fields.
    Raises BusinessLogicError on any failure (missing key, network, parse).
    """
    if not settings.GROQ_API_KEY:
        raise BusinessLogicError(
            "AI review is not configured. Set GROQ_API_KEY on the server.",
            code='ai_not_configured',
            status_code=503,
        )

    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        response = client.chat.completions.create(
            model=settings.AI_MODEL_NAME,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": _build_user_prompt(proposal)},
            ],
            temperature=0.2,
            max_tokens=1024,
        )
    except Exception as exc:
        logger.error(f"AI review request failed for proposal {proposal.pk}: {exc}")
        raise BusinessLogicError(
            "Could not reach the AI review service. Please try again later.",
            code='ai_service_unavailable',
            status_code=502,
        )

    raw_text = response.choices[0].message.content
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