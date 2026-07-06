// src/pages/dashboard/proposals/ProposalForm.jsx
import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react'

const DOCUMENT_TYPES = [
  { value: 'CV', label: 'CV / Resume' },
  { value: 'BUDGET_PLAN', label: 'Budget Plan' },
  { value: 'RESEARCH_PLAN', label: 'Research Plan' },
  { value: 'ETHICS_APPROVAL', label: 'Ethics Approval' },
  { value: 'LETTER_OF_SUPPORT', label: 'Letter of Support' },
  { value: 'OTHER', label: 'Other' },
]
import {
  createProposal,
  getProposal,
  updateProposal,
} from '../../../api/proposalsService'
import { listGrants } from '../../../api/grantsService'
import { getErrorMessage } from '../../../utils/errors'
import {
  listAttachments,
  uploadAttachment,
  submitProposal,
} from '../../../api/proposalsService'


const emptyForm = {
  grant: '',
  title: '',
  abstract: '',
  methodology: '',
  expected_outcomes: '',
  budget_requested: '',
  duration_months: '',
  team_members: '',
}

const inputClass =
  'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600'
const labelClass = 'block text-sm font-medium text-slate-700 mb-1'

function formatSize(bytes) {
  if (!bytes) return ''
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export default function ProposalForm() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    ...emptyForm,
    grant: searchParams.get('grant') || '',
  })
  const [grants, setGrants] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const submittingRef = useRef(false)
  const [error, setError] = useState('')

  // Once a proposal exists (edit mode, or right after creating one),
  // this holds its id and unlocks the document upload panel.
  const [proposalId, setProposalId] = useState(isEdit ? id : null)
  const [attachments, setAttachments] = useState([])
 const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [documentType, setDocumentType] = useState('OTHER')

  useEffect(() => {
    const loadGrants = async () => {
      try {
        const data = await listGrants({ status: 'OPEN', page_size: 100 })
        setGrants(data.results ?? [])
      } catch {
        // Non-fatal; form still usable if grant already selected
      }
    }
    loadGrants()
  }, [])

  useEffect(() => {
    if (!isEdit) return
    const loadProposal = async () => {
      setLoading(true)
      try {
        const data = await getProposal(id)
        setForm({
          grant: data.grant?.id || '',
          title: data.title || '',
          abstract: data.abstract || '',
          methodology: data.methodology || '',
          expected_outcomes: data.expected_outcomes || '',
          budget_requested: data.budget_requested || '',
          duration_months: data.duration_months || '',
          team_members: data.team_members || '',
        })
      } catch {
        setError('Failed to load proposal.')
      } finally {
        setLoading(false)
      }
    }
    loadProposal()
  }, [id, isEdit])

  // Load attachments whenever we have a valid proposal id
  useEffect(() => {
    if (!proposalId) return
    const loadAttachments = async () => {
      try {
        const data = await listAttachments(proposalId)
        setAttachments(data.data ?? [])
      } catch {
        // non-fatal
      }
    }
    loadAttachments()
  }, [proposalId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

 const handleSubmit = async (e) => {
    e.preventDefault()
    if (submittingRef.current) return
    submittingRef.current = true
    setSaving(true)
    setError('')
    try {
      if (isEdit) {
        const { grant, ...rest } = form
        await updateProposal(id, {
          ...rest,
          budget_requested: Number(form.budget_requested),
          duration_months: Number(form.duration_months),
        })
        navigate('/dashboard/proposals')
      } else {
        const created = await createProposal({
          ...form,
          budget_requested: Number(form.budget_requested),
          duration_months: Number(form.duration_months),
        })
        // Unlock the document upload panel instead of navigating away
        setProposalId(created.id)
      }
} catch (err) {
      setError(getErrorMessage(err, 'Failed to save proposal. Check the fields.'))
    } finally {
      setSaving(false)
      submittingRef.current = false
    }
  }
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !proposalId) return
    setUploading(true)
    setUploadError('')
    try {
      await uploadAttachment(proposalId, file, documentType)
      const data = await listAttachments(proposalId)
      setAttachments(data.data ?? [])
    } catch (err) {
      setUploadError(
        err.response?.data?.message || 'Failed to upload file. Try a smaller file or a different format.'
      )
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }
  const handleSubmitForReview = async () => {
    setSubmitting(true)
    setUploadError('')
    try {
      await submitProposal(proposalId)
      navigate(`/dashboard/proposals/${proposalId}`)
    } catch (err) {
      setUploadError(getErrorMessage(err, 'Failed to submit the proposal for review.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="text-slate-400">Loading...</p>
  }

  // ---------- After creation: show the document upload step ----------
  if (!isEdit && proposalId) {
    return (
      <div className="max-w-2xl space-y-5">
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-100 rounded-lg px-4 py-3 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Proposal saved as a draft. Attach any supporting documents below, then
          submit it for review from the Proposals list when you're ready.
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">Supporting Documents</h2>
          <p className="text-sm text-slate-500">
            Upload research plans, budgets, CVs, or any other supporting files
            (PDF, DOCX, XLSX — max size depends on server settings).
          </p>

          {uploadError && (
            <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-100">
              {uploadError}
            </div>
          )}

<div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Document Type
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
            >
              {DOCUMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-ocean-200 rounded-lg py-8 cursor-pointer hover:border-ocean-400 hover:bg-ocean-50 transition">
            {uploading ? (
              <Loader2 className="h-6 w-6 text-ocean-700 animate-spin" />
            ) : (
              <Upload className="h-6 w-6 text-ocean-700" />
            )}
            <span className="text-sm text-slate-600">
              {uploading ? 'Uploading...' : 'Click to choose a file'}
            </span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>

        {attachments.length > 0 && (
            <ul className="divide-y divide-slate-100 border border-slate-100 rounded-lg">
              {attachments.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <FileText className="h-4 w-4 text-ocean-700 shrink-0" />
                  <span className="flex-1 text-slate-700 truncate">{a.file_name}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-ocean-100 text-ocean-800 shrink-0">
                    {a.document_type_display || a.document_type}
                  </span>
                  <span className="text-slate-400 text-xs shrink-0">{formatSize(a.file_size)}</span>
                </li>
              ))}
            </ul>
          )}    

        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate(`/dashboard/proposals/${proposalId}`)}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Save as draft for now
          </button>
<button
            onClick={handleSubmitForReview}
            disabled={submitting}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-ocean-900 hover:bg-ocean-800 disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </div>
      </div>
    )
  }

  // ---------- Step 1: the proposal details form ----------

  // ---------- Step 1: the proposal details form ----------
  return (
    <div className="max-w-3xl space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">
        {isEdit ? 'Edit Proposal' : 'New Proposal'}
      </h1>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div>
          <label className={labelClass}>Grant Opportunity</label>
          <select
            name="grant"
            value={form.grant}
            onChange={handleChange}
            required
            disabled={isEdit}
            className={`${inputClass} disabled:bg-ocean-50`}
          >
            <option value="">Select an open grant</option>
            {grants.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
          {isEdit && (
            <p className="text-xs text-slate-400 mt-1">Grant cannot be changed after creation.</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Abstract</label>
          <textarea
            name="abstract"
            value={form.abstract}
            onChange={handleChange}
            required
            rows={3}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Methodology</label>
          <textarea
            name="methodology"
            value={form.methodology}
            onChange={handleChange}
            required
            rows={4}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Expected Outcomes</label>
          <textarea
            name="expected_outcomes"
            value={form.expected_outcomes}
            onChange={handleChange}
            rows={3}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Budget Requested ($)</label>
            <input
              type="number"
              name="budget_requested"
              value={form.budget_requested}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Duration (months)</label>
            <input
              type="number"
              name="duration_months"
              value={form.duration_months}
              onChange={handleChange}
              required
              min="1"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Team Members</label>
          <textarea
            name="team_members"
            value={form.team_members}
            onChange={handleChange}
            rows={2}
            placeholder="e.g. Dr. Jane Doe (Co-PI), John Smith (Research Assistant)"
            className={inputClass}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard/proposals')}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-ocean-900 hover:bg-ocean-800 disabled:opacity-60"
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Continue to Documents'}
          </button>
        </div>
      </form>
    </div>
  )
}