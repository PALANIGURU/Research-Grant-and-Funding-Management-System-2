// src/pages/dashboard/proposals/ProposalDetail.jsx
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Send,
  CheckCircle,
  XCircle,
  RotateCcw,
  FileText,
  Download,
  Sparkles,
} from 'lucide-react'
import {
  getProposal,
  submitProposal,
  startReview,
  approveProposal,
  rejectProposal,
  requestRevision,
  resubmitProposal,
  getProposalReviews,
  addProposalReview,
  listAttachments,
  generateAIReview,
} from '../../../api/proposalsService'
import { useAuth } from '../../../context/AuthContext'
import { ROLES } from '../../../utils/roles'
import StatusBadge from '../../../components/common/StatusBadge'
import { getErrorMessage } from '../../../utils/errors'

export default function ProposalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [proposal, setProposal] = useState(null)
  const [reviews, setReviews] = useState([])
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [revisionComments, setRevisionComments] = useState('')
  const [showRejectBox, setShowRejectBox] = useState(false)
  const [showRevisionBox, setShowRevisionBox] = useState(false)

  const [aiReview, setAiReview] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const [reviewForm, setReviewForm] = useState({
    score: '',
    methodology_score: '',
    impact_score: '',
    feasibility_score: '',
    budget_score: '',
    comments: '',
    recommendation: 'APPROVE',
  })

  const isOwner = proposal?.submitted_by?.id === user?.id
  const isManager = user?.role === ROLES.ADMIN || user?.role === ROLES.GRANT_MANAGER
  const isReviewer = user?.role === ROLES.REVIEWER

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getProposal(id)
      setProposal(data)
      const reviewData = await getProposalReviews(id)
      setReviews(reviewData.data ?? [])
      const attachmentData = await listAttachments(id)
      setAttachments(attachmentData.data ?? [])
    } catch {
      setError('Failed to load proposal.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const runAction = async (fn, ...args) => {
    setActionLoading(true)
    setError('')
    try {
      await fn(id, ...args)
      await load()
      setShowRejectBox(false)
      setShowRevisionBox(false)
    } catch (err) {
      setError(getErrorMessage(err, 'Action failed.'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleGenerateAIReview = async () => {
    setAiLoading(true)
    setAiError('')
    try {
      const result = await generateAIReview(id)
      setAiReview(result.data)
    } catch (err) {
      setAiError(getErrorMessage(err, 'Failed to generate AI review.'))
    } finally {
      setAiLoading(false)
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    setError('')
    try {
      await addProposalReview(id, {
        ...reviewForm,
        score: Number(reviewForm.score),
        methodology_score: Number(reviewForm.methodology_score || 0),
        impact_score: Number(reviewForm.impact_score || 0),
        feasibility_score: Number(reviewForm.feasibility_score || 0),
        budget_score: Number(reviewForm.budget_score || 0),
      })
      await load()
      setReviewForm({
        score: '',
        methodology_score: '',
        impact_score: '',
        feasibility_score: '',
        budget_score: '',
        comments: '',
        recommendation: 'APPROVE',
      })
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to submit review.'))
    } finally {
      setActionLoading(false)
    }
  }

  const fileOrigin = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')
  const attachmentUrl = (fileUrl) =>
    fileUrl?.startsWith('http') ? fileUrl : `${fileOrigin}${fileUrl}`

  if (loading) return <p className="text-slate-400">Loading...</p>
  if (error && !proposal) {
    return (
      <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
        {error}
      </div>
    )
  }
  if (!proposal) return null

  const canEdit = isOwner && ['DRAFT', 'REVISION_REQUESTED'].includes(proposal.status)
  const canSubmit = (isOwner || isManager) && proposal.status === 'DRAFT'
  const canResubmit = (isOwner || isManager) && proposal.status === 'REVISION_REQUESTED'
  const canStartReview = isManager && proposal.status === 'SUBMITTED'
  const canDecide = isManager && proposal.status === 'UNDER_REVIEW'
  const canReview = isReviewer && ['SUBMITTED', 'UNDER_REVIEW'].includes(proposal.status)

  return (
    <div className="max-w-3xl space-y-5">
      <Link
        to="/dashboard/proposals"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Proposals
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{proposal.title}</h1>
            <p className="text-sm text-slate-400 mt-1">
              {proposal.reference_number} · Grant: {proposal.grant?.title}
            </p>
          </div>
          <StatusBadge status={proposal.status} />
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div>
          <p className="text-slate-400 text-sm mb-1">Abstract</p>
          <p className="text-slate-700 text-sm whitespace-pre-line">{proposal.abstract}</p>
        </div>

        <div>
          <p className="text-slate-400 text-sm mb-1">Methodology</p>
          <p className="text-slate-700 text-sm whitespace-pre-line">{proposal.methodology}</p>
        </div>

        {proposal.expected_outcomes && (
          <div>
            <p className="text-slate-400 text-sm mb-1">Expected Outcomes</p>
            <p className="text-slate-700 text-sm whitespace-pre-line">{proposal.expected_outcomes}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Budget Requested</p>
            <p className="font-medium text-slate-800">
              ${Number(proposal.budget_requested).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Duration</p>
            <p className="font-medium text-slate-800">{proposal.duration_months} months</p>
          </div>
          <div>
            <p className="text-slate-400">Submitted By</p>
            <p className="font-medium text-slate-800">
              {proposal.submitted_by?.first_name} {proposal.submitted_by?.last_name}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Average Score</p>
            <p className="font-medium text-slate-800">
              {Number(proposal.average_score || 0).toFixed(1)}
            </p>
          </div>
        </div>

        {proposal.team_members && (
          <div>
            <p className="text-slate-400 text-sm mb-1">Team Members</p>
            <p className="text-slate-700 text-sm">{proposal.team_members}</p>
          </div>
        )}

        {proposal.rejection_reason && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-700">
            <strong>Rejection reason:</strong> {proposal.rejection_reason}
          </div>
        )}

        {proposal.revision_comments && (
          <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-sm text-orange-700">
            <strong>Revision requested:</strong> {proposal.revision_comments}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
          {canEdit && (
            <Link
              to={`/dashboard/proposals/${proposal.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 border border-slate-200 hover:bg-ocean-50"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          )}
          {canSubmit && (
            <button
              onClick={() => runAction(submitProposal)}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-ocean-700 hover:bg-ocean-800 disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              Submit Proposal
            </button>
          )}
          {canResubmit && (
            <button
              onClick={() => runAction(resubmitProposal)}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-ocean-700 hover:bg-ocean-800 disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              Resubmit
            </button>
          )}
          {canStartReview && (
            <button
              onClick={() => runAction(startReview)}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 border border-slate-200 hover:bg-ocean-50"
            >
              Start Review
            </button>
          )}
          {canDecide && (
            <>
              <button
                onClick={() => runAction(approveProposal)}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-60"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </button>
              <button
                onClick={() => setShowRevisionBox((v) => !v)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-orange-700 border border-orange-200 hover:bg-orange-50"
              >
                <RotateCcw className="h-4 w-4" />
                Request Revision
              </button>
              <button
                onClick={() => setShowRejectBox((v) => !v)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>
            </>
          )}
        </div>

        {showRejectBox && (
          <div className="border border-red-200 rounded-lg p-4 space-y-3">
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={2}
              placeholder="Reason for rejection..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={() => runAction(rejectProposal, { rejection_reason: rejectReason })}
              disabled={actionLoading || !rejectReason}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
            >
              Confirm Reject
            </button>
          </div>
        )}

        {showRevisionBox && (
          <div className="border border-orange-200 rounded-lg p-4 space-y-3">
            <textarea
              value={revisionComments}
              onChange={(e) => setRevisionComments(e.target.value)}
              rows={2}
              placeholder="What needs to be revised?"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={() => runAction(requestRevision, { revision_comments: revisionComments })}
              disabled={actionLoading || !revisionComments}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-60"
            >
              Confirm Request Revision
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
        <h2 className="font-semibold text-slate-800">Supporting Documents</h2>
        {attachments.length === 0 ? (
          <p className="text-sm text-slate-400">No documents were attached.</p>
        ) : (
          <div className="space-y-2">
            {attachments.map((a) => (
              <a
                key={a.id}
                href={attachmentUrl(a.file)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between border border-slate-100 rounded-lg px-3 py-2 text-sm hover:bg-ocean-50"
              >
                <span className="flex items-center gap-2 text-slate-700">
                  <FileText className="h-4 w-4 text-slate-400" />
                  {a.file_name}
                  <span className="text-slate-400">({a.document_type_display})</span>
                </span>
                <Download className="h-4 w-4 text-slate-400" />
              </a>
            ))}
          </div>
        )}
      </div>

      {isManager && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              AI Review Assistant
            </h2>
            <button
              onClick={handleGenerateAIReview}
              disabled={aiLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60"
            >
              {aiLoading ? 'Generating...' : 'Generate AI Review'}
            </button>
          </div>

          {aiError && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
              {aiError}
            </div>
          )}

          {aiReview && (
            <div className="space-y-4 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Risk Score</p>
                <span
                  className={`text-sm font-bold px-2.5 py-1 rounded-full ${
                    aiReview.risk_score >= 70
                      ? 'bg-red-100 text-red-700'
                      : aiReview.risk_score >= 40
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {aiReview.risk_score} / 100
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Summary</p>
                <p className="text-sm text-slate-600 whitespace-pre-line">{aiReview.summary}</p>
              </div>

              {aiReview.risk_flags?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Risk Flags</p>
                  <ul className="list-disc list-inside text-sm text-red-600 space-y-0.5">
                    {aiReview.risk_flags.map((flag, i) => (
                      <li key={i}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {aiReview.strengths?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Strengths</p>
                    <ul className="list-disc list-inside text-sm text-green-700 space-y-0.5">
                      {aiReview.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiReview.weaknesses?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Weaknesses</p>
                    <ul className="list-disc list-inside text-sm text-orange-700 space-y-0.5">
                      {aiReview.weaknesses.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <p className="text-sm font-medium text-slate-700">Suggested Recommendation</p>
                <StatusBadge status={aiReview.suggested_recommendation} />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-slate-800">Reviews</h2>

        {reviews.length === 0 ? (
          <p className="text-sm text-slate-400">No reviews submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="border border-slate-100 rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-800">{r.reviewer_name}</p>
                  <StatusBadge status={r.recommendation} />
                </div>
                <p className="text-slate-500 mt-1">Score: {r.score}</p>
                <p className="text-slate-600 mt-1">{r.comments}</p>
              </div>
            ))}
          </div>
        )}

        {canReview && (
          <form onSubmit={handleReviewSubmit} className="border-t border-slate-100 pt-4 space-y-3">
            <p className="text-sm font-medium text-slate-700">Submit your review</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <input
                type="number"
                min="0"
                max="100"
                required
                placeholder="Overall score"
                value={reviewForm.score}
                onChange={(e) => setReviewForm({ ...reviewForm, score: e.target.value })}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
              />
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Methodology"
                value={reviewForm.methodology_score}
                onChange={(e) => setReviewForm({ ...reviewForm, methodology_score: e.target.value })}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
              />
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Impact"
                value={reviewForm.impact_score}
                onChange={(e) => setReviewForm({ ...reviewForm, impact_score: e.target.value })}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
              />
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Feasibility"
                value={reviewForm.feasibility_score}
                onChange={(e) => setReviewForm({ ...reviewForm, feasibility_score: e.target.value })}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
              />
            </div>
            <textarea
              required
              placeholder="Comments"
              value={reviewForm.comments}
              onChange={(e) => setReviewForm({ ...reviewForm, comments: e.target.value })}
              rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
            />
            <select
              value={reviewForm.recommendation}
              onChange={(e) => setReviewForm({ ...reviewForm, recommendation: e.target.value })}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
            >
              <option value="APPROVE">Recommend Approve</option>
              <option value="REJECT">Recommend Reject</option>
              <option value="REVISE">Recommend Revision</option>
            </select>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-ocean-700 hover:bg-ocean-800 disabled:opacity-60"
            >
              Submit Review
            </button>
          </form>
        )}
      </div>
    </div>
  )
}