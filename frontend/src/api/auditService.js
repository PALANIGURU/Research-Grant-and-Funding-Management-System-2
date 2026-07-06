// src/api/auditService.js
import apiClient from './client'

export const listAuditLogs = (params = {}) =>
  apiClient.get('/audit/logs/', { params }).then((res) => res.data)

export const getAuditLog = (id) =>
  apiClient.get(`/audit/logs/${id}/`).then((res) => res.data)