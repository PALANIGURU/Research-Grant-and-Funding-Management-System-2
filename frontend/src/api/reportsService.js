// src/api/reportsService.js
import apiClient from './client'

// Milestones
export const listMilestones = (params = {}) =>
  apiClient.get('/reports/milestones/', { params }).then((res) => res.data)

export const getMilestone = (id) =>
  apiClient.get(`/reports/milestones/${id}/`).then((res) => res.data)

export const createMilestone = (payload) =>
  apiClient.post('/reports/milestones/', payload).then((res) => res.data)

export const updateMilestone = (id, payload) =>
  apiClient.patch(`/reports/milestones/${id}/`, payload).then((res) => res.data)

export const deleteMilestone = (id) =>
  apiClient.delete(`/reports/milestones/${id}/`).then((res) => res.data)

// Progress reports
export const listProgressReports = (params = {}) =>
  apiClient.get('/reports/progress/', { params }).then((res) => res.data)

export const createProgressReport = (payload) =>
  apiClient.post('/reports/progress/', payload).then((res) => res.data)

export const updateProgressReport = (id, payload) =>
  apiClient.patch(`/reports/progress/${id}/`, payload).then((res) => res.data)

export const deleteProgressReport = (id) =>
  apiClient.delete(`/reports/progress/${id}/`).then((res) => res.data)

// Final reports
export const listFinalReports = (params = {}) =>
  apiClient.get('/reports/final/', { params }).then((res) => res.data)

export const createFinalReport = (payload) =>
  apiClient.post('/reports/final/', payload).then((res) => res.data)

export const updateFinalReport = (id, payload) =>
  apiClient.patch(`/reports/final/${id}/`, payload).then((res) => res.data)

export const deleteFinalReport = (id) =>
  apiClient.delete(`/reports/final/${id}/`).then((res) => res.data)
export const markMilestoneComplete = (id) =>
  apiClient.post(`/reports/milestones/${id}/mark_complete/`).then((res) => res.data)

export const submitProgressReport = (id) =>
  apiClient.post(`/reports/progress/${id}/submit/`).then((res) => res.data)

export const reviewProgressReport = (id, payload) =>
  apiClient.post(`/reports/progress/${id}/review/`, payload).then((res) => res.data)

export const submitFinalReport = (id) =>
  apiClient.post(`/reports/final/${id}/submit/`).then((res) => res.data)

export const reviewFinalReport = (id, payload) =>
  apiClient.post(`/reports/final/${id}/review/`, payload).then((res) => res.data)
