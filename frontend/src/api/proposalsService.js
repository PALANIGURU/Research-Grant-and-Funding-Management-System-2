// src/api/proposalsService.js
import apiClient from './client'

export const listProposals = (params = {}) =>
  apiClient.get('/proposals/submissions/', { params }).then((res) => res.data)

export const getProposal = (id) =>
  apiClient.get(`/proposals/submissions/${id}/`).then((res) => res.data)

export const createProposal = (payload) =>
  apiClient.post('/proposals/submissions/', payload).then((res) => res.data)

export const updateProposal = (id, payload) =>
  apiClient.patch(`/proposals/submissions/${id}/`, payload).then((res) => res.data)

export const deleteProposal = (id) =>
  apiClient.delete(`/proposals/submissions/${id}/`).then((res) => res.data)

export const submitProposal = (id) =>
  apiClient.post(`/proposals/submissions/${id}/submit/`).then((res) => res.data)

export const approveProposal = (id) =>
  apiClient.post(`/proposals/submissions/${id}/approve/`).then((res) => res.data)

export const rejectProposal = (id, payload) =>
  apiClient.post(`/proposals/submissions/${id}/reject/`, payload).then((res) => res.data)

export const requestRevision = (id, payload) =>
  apiClient
    .post(`/proposals/submissions/${id}/request_revision/`, payload)
    .then((res) => res.data)
export const startReview = (id) =>
  apiClient.post(`/proposals/submissions/${id}/start_review/`).then((res) => res.data)

export const resubmitProposal = (id) =>
  apiClient.post(`/proposals/submissions/${id}/resubmit/`).then((res) => res.data)

export const getProposalReviews = (id) =>
  apiClient.get(`/proposals/submissions/${id}/reviews/`).then((res) => res.data)

export const generateAIReview = (id) =>
  apiClient.post(`/proposals/submissions/${id}/ai_review/`).then((res) => res.data)

export const addProposalReview = (id, payload) =>
  apiClient.post(`/proposals/submissions/${id}/reviews/`, payload).then((res) => res.data)
export const listAttachments = (proposalId) =>
  apiClient
    .get(`/proposals/submissions/${proposalId}/attachments/`)
    .then((res) => res.data)

export const uploadAttachment = (proposalId, file, documentType = 'OTHER', description = '') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('document_type', documentType)
  if (description) formData.append('description', description)
  return apiClient
    .post(`/proposals/submissions/${proposalId}/attachments/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data)
}